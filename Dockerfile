FROM python:3.11-slim

WORKDIR /app

# System certificates + OpenSSL
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates \
       openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy MAX / Russian trusted certificates
COPY certs/russian_trusted_root_ca.cer /tmp/russian_trusted_root_ca.cer
COPY certs/russian_trusted_sub_ca.cer /tmp/russian_trusted_sub_ca.cer

# Convert certificates to PEM .crt format and install them
RUN set -eux; \
    if openssl x509 -in /tmp/russian_trusted_root_ca.cer -noout >/dev/null 2>&1; then \
        openssl x509 -in /tmp/russian_trusted_root_ca.cer \
            -out /usr/local/share/ca-certificates/russian_trusted_root_ca.crt; \
    else \
        openssl x509 -inform DER \
            -in /tmp/russian_trusted_root_ca.cer \
            -out /usr/local/share/ca-certificates/russian_trusted_root_ca.crt; \
    fi; \
    if openssl x509 -in /tmp/russian_trusted_sub_ca.cer -noout >/dev/null 2>&1; then \
        openssl x509 -in /tmp/russian_trusted_sub_ca.cer \
            -out /usr/local/share/ca-certificates/russian_trusted_sub_ca.crt; \
    else \
        openssl x509 -inform DER \
            -in /tmp/russian_trusted_sub_ca.cer \
            -out /usr/local/share/ca-certificates/russian_trusted_sub_ca.crt; \
    fi; \
    update-ca-certificates; \
    rm -f /tmp/russian_trusted_root_ca.cer /tmp/russian_trusted_sub_ca.cer

ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
ENV SSL_CERT_DIR=/etc/ssl/certs

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p data \
    && python scripts/convert_bd.py

CMD ["sh", "-c", "uvicorn bot.main:app --host 0.0.0.0 --port ${PORT:-8000}"]