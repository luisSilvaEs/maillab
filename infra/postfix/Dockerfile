# infra/postfix/Dockerfile

FROM boky/postfix:latest

# Copy our config files
COPY main.cf /etc/postfix/main.cf
COPY master.cf /etc/postfix/master.cf
COPY ldap-accounts.cf /etc/postfix/ldap-accounts.cf
COPY entrypoint-ldap.sh /docker-init.d/entrypoint-ldap.sh

RUN chmod +x /docker-init.d/entrypoint-ldap.sh

EXPOSE 25