#!/bin/bash
echo "Substituting LDAP password in ldap-accounts.cf..."
sed -i "s|\${LDAP_ADMIN_PASSWORD}|${LDAP_ADMIN_PASSWORD}|g" /etc/postfix/ldap-accounts.cf