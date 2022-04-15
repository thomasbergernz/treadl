FROM node:latest

RUN mkdir /app
ADD ./ /app
WORKDIR /app
RUN yarn
RUN yarn build

FROM nginx:stable-alpine
COPY /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
