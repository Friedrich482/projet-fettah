FROM debian:12

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        openssh-server \
        curl \
    && rm -rf /var/lib/apt/lists/*

# sshd refuses to start without its privilege separation directory, and the
# openssh-server postinst does not create it (adduser runs --no-create-home).
RUN mkdir -p /run/sshd

RUN printf '%s\n' \
        'PermitRootLogin yes' \
        'PasswordAuthentication yes' \
        'UsePAM yes' \
        > /etc/ssh/sshd_config.d/lab.conf

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D", "-e"]
