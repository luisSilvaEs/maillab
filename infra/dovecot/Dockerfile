# infra/dovecot/Dockerfile

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    dovecot-core \
    dovecot-imapd \
    dovecot-lmtpd \
    dovecot-ldap \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 5000 vmail && \
    useradd -u 5000 -g vmail -d /var/mail/vhosts -s /sbin/nologin vmail

RUN mkdir -p /var/spool/postfix/private && \
    chown -R root:root /var/spool/postfix

RUN mkdir -p /var/mail/vhosts && \
    chown -R vmail:vmail /var/mail/vhosts

COPY dovecot.conf /etc/dovecot/dovecot.conf
COPY conf.d/10-auth.conf /etc/dovecot/conf.d/10-auth.conf
COPY conf.d/10-mail.conf /etc/dovecot/conf.d/10-mail.conf
COPY conf.d/10-master.conf /etc/dovecot/conf.d/10-master.conf
COPY auth-ldap.conf.ext /etc/dovecot/auth-ldap.conf.ext
COPY dovecot-ldap.conf.ext /etc/dovecot/dovecot-ldap.conf.ext
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 143

CMD ["/entrypoint.sh"]