package com.vfms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import lombok.extern.slf4j.Slf4j;

/**
 * Async configuration for email sending and other background tasks
 * Configures thread pool to prevent resource exhaustion and handle concurrent async operations
 * 
 * Thread Pool Configuration:
 * - Core Threads: 5 (always running, handle normal load)
 * - Max Threads: 10 (peak load handling)
 * - Queue Capacity: 100 (pending tasks buffer)
 * - Rejection Policy: AbortPolicy (throw exception on overflow - don't silently fail)
 */
@Slf4j
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Configures thread pool executor for async tasks
     * Prevents unlimited thread creation and manages resource allocation
     * Used for: Email sending, notifications, batch operations
     * 
     * @return configured TaskExecutor bean
     */
    @Bean(name = "taskExecutor")
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // Core thread pool size (threads kept alive even if idle)
        executor.setCorePoolSize(5);
        
        // Maximum thread pool size (max concurrent tasks)
        executor.setMaxPoolSize(10);
        
        // Queue capacity for pending tasks (buffer size)
        executor.setQueueCapacity(100);
        
        // Thread name prefix for logging and debugging
        executor.setThreadNamePrefix("vfms-async-");
        
        // Reject policy: throw exception if queue is full (fail-fast)
        // Never silently drop tasks
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.AbortPolicy());
        
        // Initialize the executor
        executor.initialize();
        
        log.info("AsyncConfig initialized: corePoolSize=5, maxPoolSize=10, queueCapacity=100");
        return executor;
    }
}
