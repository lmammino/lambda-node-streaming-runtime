FROM public.ecr.aws/lambda/provided:al2

RUN yum -y install curl
RUN curl -sL https://rpm.nodesource.com/setup_14.x | bash -
RUN yum install -y nodejs
COPY ./entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["cp", "/usr/bin/node", "/target"]