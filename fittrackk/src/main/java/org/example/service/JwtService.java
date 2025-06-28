package org.example.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.*;
import java.util.function.Function;

@Service
public class JwtService {

    // Minimum 32 karakterlik güçlü bir secret key
    private static final String SECRET_KEY = "supersecuresecretkeyfittrackforjwt2024!";

    //JWT imzalama anahtarını üret
    private Key getSignInKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    //Token'dan kullanıcı adı (email/username) çıkar
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    //Token'dan sona erme zamanı çıkar
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    //Belirli bir claim'i çıkarmak için
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    //Tüm claim'leri çözümle
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Token süresi geçmiş mi?
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // =================== TOKEN OLUŞTURMA ==================== //

    //Kullanıcı detayları ile token oluştur (rolü claim'e ekle)
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();

        //Kullanıcının rolünü JWT claim'lerine ekle
        String role = userDetails.getAuthorities()
                .stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_CLIENT");

        claims.put("role", role);

        return generateToken(claims, userDetails);
    }

    //Ekstra claim'lerle token üret
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername()) // genelde email olur
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 saat geçerli
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ===================== DOĞRULUK KONTROLÜ =================== //

    //Token geçerli mi?
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
}
