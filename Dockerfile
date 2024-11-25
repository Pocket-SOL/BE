FROM node:18

RUN apt-get update && apt-get install -y build-essential python3

WORKDIR /app
#npm install 을 위해, package.json과 package-lock.json을 먼저 copy해둠
COPY package*.json /app/
RUN npm install
COPY . /app
EXPOSE 8080

#컨테이너가 켜지자마자 실행할 명령어 
#npm start : package.json의 scripts에 있는 start 명령어를 실행
CMD ["npm", "start"]