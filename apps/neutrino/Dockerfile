# -------------------------------------------------------------------
# 1) BUILD STAGE - Install dependencies & build neutrino
# -------------------------------------------------------------------
FROM mcr.microsoft.com/playwright:v1.50.0-jammy AS builder

# Set the working directory
WORKDIR /app

# Declare build args
ARG OPENAI_API_KEY
ARG CLAUDE_API_KEY
ARG GEMINI_API_KEY
ARG RABBITMQ_CONN_URL
ARG SUPABASE_URL
ARG SUPABASE_KEY

ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV CLAUDE_API_KEY=$CLAUDE_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV RABBITMQ_CONN_URL=$RABBITMQ_CONN_URL
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_KEY=$SUPABASE_KEY

# Copy config and source files, then build
COPY package.json yarn.lock ./
COPY apps/neutrino/package.json apps/neutrino/
COPY apps/neutrino/ apps/neutrino/
COPY packages/ packages/

RUN yarn install --frozen-lockfile
RUN yarn workspace neutrino build

# -------------------------------------------------------------------
# 2) RUN STAGE - Copy only the built app & node_modules from root
# -------------------------------------------------------------------
FROM  mcr.microsoft.com/playwright:v1.50.0-jammy

WORKDIR /app

# Declare build args
ARG OPENAI_API_KEY
ARG CLAUDE_API_KEY
ARG GEMINI_API_KEY
ARG RABBITMQ_CONN_URL
ARG SUPABASE_URL
ARG SUPABASE_KEY

ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV CLAUDE_API_KEY=$CLAUDE_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV RABBITMQ_CONN_URL=$RABBITMQ_CONN_URL
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_KEY=$SUPABASE_KEY

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/neutrino/build ./build
COPY --from=builder /app/packages/ ./packages

# Expose port and run
EXPOSE 3000
CMD ["node", "build/app.js"]