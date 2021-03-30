FROM alpine:latest

MAINTAINER Bhaskar Miryala <bhaskar.miryala@cdk.com>

ADD ./bin/service-ui /
ADD ./build/resources/main/public /public

ENV RP_STATICS_PATH=/public

EXPOSE 8080
ENTRYPOINT ["/service-ui"]
