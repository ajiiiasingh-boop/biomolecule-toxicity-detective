# The full application — API plus built client — in one container.
# Useful for Railway, Fly.io, Koyeb, a college server, or just proving the
# project runs anywhere.
#
#   docker build -t toxicity-detective .
#   docker run -p 4000:4000 toxicity-detective
#   open http://localhost:4000

FROM node:20-alpine

WORKDIR /app

# Copy the manifests first so Docker can cache the install layer.
COPY package.json package-lock.json* ./
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["npm", "start"]
