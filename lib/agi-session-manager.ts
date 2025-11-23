// AGI Session Manager - Intelligent Session Pooling for Hackathon
import axios from 'axios';

const AGI_BASE_URL = 'https://api.agi.tech/v1';

interface SessionPool {
  sessionId: string;
  createdAt: number;
  lastUsed: number;
  isActive: boolean;
  currentTask: string | null;
}

class AGISessionManager {
  private sessionPool: SessionPool[] = [];
  private maxSessions = 2; // Keep only 2 sessions in pool
  private sessionTimeout = 25 * 60 * 1000; // 25 minutes max age
  private maxPoolSize = 3; // Maximum sessions to maintain

  constructor(private apiKey: string) {}

  /**
   * Get an available session from pool or create new one
   */
  async getSession(taskType: string): Promise<string> {
    console.log(`[SessionManager] Getting session for task: ${taskType}`);
    
    // Clean up expired sessions first
    await this.cleanupExpiredSessions();
    
    // Find available session
    let availableSession = this.sessionPool.find(s => !s.isActive);
    
    if (availableSession) {
      availableSession.isActive = true;
      availableSession.lastUsed = Date.now();
      availableSession.currentTask = taskType;
      console.log(`[SessionManager] Reusing session: ${availableSession.sessionId}`);
      return availableSession.sessionId;
    }

    // Create new session if under pool limit
    if (this.sessionPool.length < this.maxPoolSize) {
      const newSession = await this.createNewSession();
      this.addToPool(newSession, taskType);
      console.log(`[SessionManager] Created new session: ${newSession}`);
      return newSession;
    }

    // Wait for a session to become available
    console.log(`[SessionManager] Pool full, waiting for available session...`);
    return await this.waitForAvailableSession(taskType);
  }

  /**
   * Release session back to pool
   */
  releaseSession(sessionId: string): void {
    const session = this.sessionPool.find(s => s.sessionId === sessionId);
    if (session) {
      session.isActive = false;
      session.currentTask = null;
      console.log(`[SessionManager] Released session: ${sessionId}`);
    }
  }

  /**
   * Create new AGI session
   */
  private async createNewSession(): Promise<string> {
    console.log(`[SessionManager] Creating new AGI session...`);
    
    try {
      const response = await axios.post(
        `${AGI_BASE_URL}/sessions`,
        { agent_name: 'agi-0' },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const sessionId = response.data.session_id;
      if (!sessionId) {
        throw new Error('AGI API returned null session_id');
      }

      return sessionId;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 503 && error.response?.data?.detail?.includes('Rate limit exceeded')) {
          throw new Error('AGI session limit reached. Please wait for sessions to expire or check dashboard for cleanup.');
        }
        throw new Error(`AGI session creation failed: ${error.response?.status} ${error.response?.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Add session to pool
   */
  private addToPool(sessionId: string, taskType: string): void {
    const session: SessionPool = {
      sessionId,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      isActive: true,
      currentTask: taskType
    };

    this.sessionPool.push(session);
    
    // Maintain pool size
    if (this.sessionPool.length > this.maxSessions) {
      const oldestSession = this.sessionPool
        .sort((a, b) => a.createdAt - b.createdAt)[0];
      
      if (!oldestSession.isActive) {
        this.deleteSession(oldestSession.sessionId);
        this.sessionPool = this.sessionPool.filter(s => s.sessionId !== oldestSession.sessionId);
      }
    }
  }

  /**
   * Clean up expired sessions
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now();
    const expiredSessions = this.sessionPool.filter(
      s => (now - s.createdAt) > this.sessionTimeout
    );

    for (const session of expiredSessions) {
      if (!session.isActive) {
        await this.deleteSession(session.sessionId);
        this.sessionPool = this.sessionPool.filter(s => s.sessionId !== session.sessionId);
        console.log(`[SessionManager] Cleaned up expired session: ${session.sessionId}`);
      }
    }
  }

  /**
   * Delete AGI session
   */
  private async deleteSession(sessionId: string): Promise<void> {
    try {
      await axios.delete(`${AGI_BASE_URL}/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        timeout: 10000,
      });
    } catch (error) {
      console.warn(`[SessionManager] Failed to delete session ${sessionId}:`, error);
    }
  }

  /**
   * Wait for available session
   */
  private async waitForAvailableSession(taskType: string): Promise<string> {
    const maxWait = 60000; // Wait max 60 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const availableSession = this.sessionPool.find(s => !s.isActive);
      if (availableSession) {
        availableSession.isActive = true;
        availableSession.lastUsed = Date.now();
        availableSession.currentTask = taskType;
        return availableSession.sessionId;
      }
    }
    
    throw new Error('No available session after waiting 60 seconds');
  }

  /**
   * Get session pool status
   */
  getPoolStatus(): { total: number; active: number; available: number } {
    const active = this.sessionPool.filter(s => s.isActive).length;
    const available = this.sessionPool.filter(s => !s.isActive).length;
    
    return {
      total: this.sessionPool.length,
      active,
      available
    };
  }

  /**
   * Cleanup all sessions
   */
  async cleanup(): Promise<void> {
    console.log(`[SessionManager] Cleaning up all sessions...`);
    
    for (const session of this.sessionPool) {
      await this.deleteSession(session.sessionId);
    }
    
    this.sessionPool = [];
    console.log(`[SessionManager] All sessions cleaned up`);
  }
}

// Singleton instance
let sessionManager: AGISessionManager | null = null;

export function getSessionManager(): AGISessionManager {
  if (!sessionManager) {
    const apiKey = process.env.AGI_API_KEY;
    if (!apiKey) {
      throw new Error('AGI_API_KEY environment variable is required');
    }
    sessionManager = new AGISessionManager(apiKey);
  }
  return sessionManager;
}

export { AGISessionManager };
