package org.example.logging;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class LoggingAspect {

    @Pointcut("within(org.example.controller..*)")
    public void controllerMethods() {}

    @Before("controllerMethods()")
    public void logBefore(JoinPoint joinPoint) {
        String method = joinPoint.getSignature().toShortString();
        Object[] args = joinPoint.getArgs();
        log.info("[START] {} | Params: {}", method, args);
    }

    @AfterReturning(pointcut = "controllerMethods()", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        String method = joinPoint.getSignature().toShortString();
        log.info("[SUCCESS] {} | Response: {}", method, result);
    }

    @AfterThrowing(pointcut = "controllerMethods()", throwing = "e")
    public void logAfterThrowing(JoinPoint joinPoint, Throwable e) {
        String method = joinPoint.getSignature().toShortString();
        log.error("[ERROR] {} | Hata: {}", method, e.getMessage(), e);
    }
}
