package rta.msbooking.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class JWTConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = Stream.concat(
            new JwtGrantedAuthoritiesConverter().convert(jwt).stream(),
            Stream.concat(extractResourceRoles(jwt).stream(), extractRealmRoles(jwt).stream())
        ).collect(Collectors.toSet());

        return new JwtAuthenticationToken(jwt, authorities, jwt.getClaim("preferred_username"));
    }

    private Collection<? extends GrantedAuthority> extractResourceRoles(Jwt jwt) {
        Map<String, Object> resourceAccess;
        Map<String, Object> resource;
        Collection<String> resourceRoles;

        if (jwt.getClaim("resource_access") == null) {
            return java.util.Collections.emptySet();
        }

        resourceAccess = jwt.getClaim("resource_access");

        if (resourceAccess.get("backend-client") == null) {
            return java.util.Collections.emptySet();
        }

        resource = (Map<String, Object>) resourceAccess.get("backend-client");

        resourceRoles = (Collection<String>) resource.get("roles");

        return resourceRoles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toSet());
    }

    private Collection<? extends GrantedAuthority> extractRealmRoles(Jwt jwt) {
        Map<String, Object> realmAccess;
        Collection<String> realmRoles;

        if (jwt.getClaim("realm_access") == null) {
            return java.util.Collections.emptySet();
        }

        realmAccess = jwt.getClaim("realm_access");
        realmRoles = (Collection<String>) realmAccess.get("roles");

        if (realmRoles == null) {
            return java.util.Collections.emptySet();
        }

        return realmRoles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toSet());
    }
}
