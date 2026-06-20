#!/bin/bash

echo "Substituting environment variables..."
sed -i "s|\${LDAP_ADMIN_PASSWORD}|${LDAP_ADMIN_PASSWORD}|g" /etc/dovecot/dovecot-ldap.conf.ext

echo "Starting Dovecot..."
exec dovecot -F