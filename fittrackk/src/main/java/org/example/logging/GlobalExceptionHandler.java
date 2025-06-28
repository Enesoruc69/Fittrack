package org.example.logging;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneral(Exception ex) {
        log.error("Beklenmeyen Hata: {}", ex.getMessage(), ex);
        return ResponseEntity.status(500).body("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalState(IllegalStateException ex) {
        log.warn("İşlem Hatası: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    // Diğer hata türleri için istersen burada genişletebiliriz.
}
