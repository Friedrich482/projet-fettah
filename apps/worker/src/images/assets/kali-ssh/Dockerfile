FROM kalilinux/kali-rolling

ARG SSH_USERNAME
ENV SSH_USERNAME=$SSH_USERNAME

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        openssh-server \
        curl \
        nano \
        vim \
        iproute2 \
        jq \
    && rm -rf /var/lib/apt/lists/*

# sshd refuses to start without its privilege separation directory, and the
# openssh-server postinst does not create it (adduser runs --no-create-home).
RUN mkdir -p /run/sshd

RUN printf '%s\n' \
        'PermitRootLogin no' \
        'PasswordAuthentication yes' \
        'UsePAM yes' \
        > /etc/ssh/sshd_config.d/lab.conf

RUN useradd --create-home --shell /bin/bash ${SSH_USERNAME}

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D", "-e"]
