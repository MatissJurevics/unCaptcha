/**
 * Rate limiter for CaptchaLM
 */

import type { RateLimitConfig } from '../core/types';

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

/**
 * In-memory rate limiter
 */
export class RateLimiter {
    private entries: Map<string, RateLimitEntry> = new Map();
    private config: Required<RateLimitConfig>;
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(config: RateLimitConfig) {
        this.config = {
            maxAttempts: config.maxAttempts,
            windowMs: config.windowMs,
        };

        // Start cleanup interval to prevent memory leaks
        this.startCleanup();
    }

    /**
     * Check if a key is rate limited
     */
    isRateLimited(key: string): boolean {
        const entry = this.entries.get(key);

        if (!entry) {
            return false;
        }

        // Check if window has expired
        if (Date.now() > entry.resetAt) {
            this.entries.delete(key);
            return false;
        }

        return entry.count >= this.config.maxAttempts;
    }

    /**
     * Record an attempt for a key
     */
    recordAttempt(key: string): { allowed: boolean; remaining: number; resetAt: number } {
        const now = Date.now();
        let entry = this.entries.get(key);

        // Create new entry or reset expired entry
        if (!entry || now > entry.resetAt) {
            entry = {
                count: 0,
                resetAt: now + this.config.windowMs,
            };
            this.entries.set(key, entry);
        }

        // Check if already rate limited
        if (entry.count >= this.config.maxAttempts) {
            return {
                allowed: false,
                remaining: 0,
                resetAt: entry.resetAt,
            };
        }

        // Record the attempt
        entry.count++;

        return {
            allowed: true,
            remaining: this.config.maxAttempts - entry.count,
            resetAt: entry.resetAt,
        };
    }

    /**
     * Get remaining attempts for a key
     */
    getRemainingAttempts(key: string): number {
        const entry = this.entries.get(key);

        if (!entry || Date.now() > entry.resetAt) {
            return this.config.maxAttempts;
        }

        return Math.max(0, this.config.maxAttempts - entry.count);
    }

    /**
     * Reset rate limit for a key
     */
    reset(key: string): void {
        this.entries.delete(key);
    }

    /**
     * Clear all rate limit entries
     */
    clear(): void {
        this.entries.clear();
    }

    /**
     * Start periodic cleanup of expired entries
     */
    private startCleanup(): void {
        // Cleanup every minute
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000);

        // Allow the process to exit even with the interval running
        if (this.cleanupInterval.unref) {
            this.cleanupInterval.unref();
        }
    }

    /**
     * Stop the cleanup interval
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.clear();
    }

    /**
     * Remove expired entries
     */
    private cleanup(): void {
        const now = Date.now();

        for (const [key, entry] of this.entries) {
            if (now > entry.resetAt) {
                this.entries.delete(key);
            }
        }
    }

    /**
     * Get current stats
     */
    getStats(): { activeKeys: number; totalAttempts: number } {
        let totalAttempts = 0;

        for (const entry of this.entries.values()) {
            totalAttempts += entry.count;
        }

        return {
            activeKeys: this.entries.size,
            totalAttempts,
        };
    }
}

/**
 * Create a rate limiter with default settings
 */
export function createRateLimiter(config?: Partial<RateLimitConfig>): RateLimiter {
    return new RateLimiter({
        maxAttempts: config?.maxAttempts ?? 10,
        windowMs: config?.windowMs ?? 60000, // 1 minute default
    });
}
