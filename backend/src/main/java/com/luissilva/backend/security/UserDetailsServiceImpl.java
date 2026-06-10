package com.luissilva.backend.security;

import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.ldap.query.LdapQueryBuilder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.naming.directory.Attributes;
import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final LdapTemplate ldapTemplate;
    private final LdapContextSource ldapContextSource;

    public UserDetailsServiceImpl(LdapTemplate ldapTemplate, LdapContextSource ldapContextSource) {
        this.ldapTemplate = ldapTemplate;
        this.ldapContextSource = ldapContextSource;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        List<UserDetails> results = ldapTemplate.search(
                LdapQueryBuilder.query()
                        .base("ou=users")
                        .where("uid").is(username),
                (Attributes attrs) -> buildUserDetails(attrs, username));

        if (results.isEmpty()) {
            throw new UsernameNotFoundException("User not found in LDAP: " + username);
        }

        return results.getFirst();
    }

    private UserDetails buildUserDetails(Attributes attrs, String username) {
        try {
            String password = attrs.get("userPassword") != null
                    ? new String((byte[]) attrs.get("userPassword").get())
                    : "";

            return User.builder()
                    .username(username)
                    .password(password)
                    .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                    .build();
        } catch (javax.naming.NamingException e) {
            throw new UsernameNotFoundException("Failed to read LDAP attributes for: " + username, e);
        }
    }
}