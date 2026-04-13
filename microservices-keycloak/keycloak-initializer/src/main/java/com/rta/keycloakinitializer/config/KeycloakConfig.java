package com.rta.keycloakinitializer.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jboss.resteasy.client.jaxrs.internal.ResteasyClientBuilderImpl;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.ws.rs.ext.ContextResolver;
import jakarta.ws.rs.ext.Provider;

@Configuration
public class KeycloakConfig {

    @Value("${rta.keycloak.serverUrl}")
    private String serverUrl;

    @Value("${rta.keycloak.realm}")
    private String realm;

    @Value("${rta.keycloak.username}")
    private String username;

    @Value("${rta.keycloak.password}")
    private String password;

    @Value("${rta.keycloak.clientId}")
    private String clientId;

    @Provider
    public static class CustomObjectMapperContextResolver implements ContextResolver<ObjectMapper> {
        private final ObjectMapper mapper;

        public CustomObjectMapperContextResolver() {
            mapper = new ObjectMapper();
            mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        }

        @Override
        public ObjectMapper getContext(Class<?> type) {
            return mapper;
        }
    }

    @Bean
    public Keycloak buildClient(){
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm(realm)
                .username(username)
                .password(password)
                .clientId(clientId)
                .resteasyClient(new ResteasyClientBuilderImpl()
                        .connectionPoolSize(10)
                        .register(new CustomObjectMapperContextResolver())
                        .build())
                .build();
    }

}
