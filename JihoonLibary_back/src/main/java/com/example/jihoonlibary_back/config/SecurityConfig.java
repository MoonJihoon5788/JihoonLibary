    package com.example.jihoonlibary_back.config;

    import lombok.RequiredArgsConstructor;
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.security.config.annotation.web.builders.HttpSecurity;
    import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
    import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
    import org.springframework.security.config.http.SessionCreationPolicy;
    import org.springframework.security.crypto.factory.PasswordEncoderFactories;
    import org.springframework.security.crypto.password.PasswordEncoder;
    import org.springframework.security.web.SecurityFilterChain;
    import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
    import org.springframework.web.cors.CorsConfiguration;
    import org.springframework.web.cors.CorsConfigurationSource;
    import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

    import java.util.Arrays;

    @EnableWebSecurity
    @Configuration
    @RequiredArgsConstructor
    public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                    .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                    .sessionManagement(sessionManagement -> sessionManagement
                            .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // 완전히 stateless
                    )
                    .authorizeHttpRequests(auth -> auth
                            // H2 콘솔 허용
                            .requestMatchers("/h2-console/**").permitAll()
                            // 인증 관련 API 허용
                            .requestMatchers("/api/auth/**").permitAll()
                            // 사용자용 API
                            .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
                            // 나머지 관리자 기능은 ADMIN 권한 필요
                            .requestMatchers("/api/admin/**").hasRole("ADMIN")
                            // 나머지 모든 요청은 인증 필요
                            .anyRequest().authenticated()
                    )
                    .csrf(AbstractHttpConfigurer::disable) // JWT 사용시 CSRF 비활성화
                    .formLogin(AbstractHttpConfigurer::disable) // 폼 로그인 비활성화
                    .httpBasic(AbstractHttpConfigurer::disable) // HTTP Basic 인증 비활성화
                    .logout(AbstractHttpConfigurer::disable) // 기본 로그아웃 비활성화 (JWT 로그아웃 사용)
                    .headers(headers -> headers
                            .frameOptions().disable() // H2 콘솔을 위해
                    )
                    .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

            return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
            CorsConfiguration configuration = new CorsConfiguration();
            configuration.setAllowedOriginPatterns(Arrays.asList("*"));
            configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            configuration.setAllowedHeaders(Arrays.asList("*"));
            configuration.setAllowCredentials(true);

            UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", configuration);
            return source;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
            return PasswordEncoderFactories.createDelegatingPasswordEncoder();
        }
    }