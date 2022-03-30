FROM alpine:3.10

LABEL maintainer="Bhaskar Miryala <bhaskarmiryala@gmail.com>"
LABEL version=5.3.5

ENV APP_DOWNLOAD_URL https://github.com/reportportal/reportportal.git

ADD ${APP_DOWNLOAD_URL}/service-ui_linux_amd64 /service-ui
ADD ${APP_DOWNLOAD_URL}/ui.tar.gz /

RUN mkdir /public
RUN chmod +x /service-ui
RUN tar -zxvf ui.tar.gz -C /public && rm -f ui.tar.gz

ENV RP_STATICS_PATH=/public


EXPOSE 8080
ENTRYPOINT ["/service-ui"]
