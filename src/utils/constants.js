import { env } from "~/config/environment"

export const WHITELIST_DOMAINS = [
  "https://trello-web-ten-nu.vercel.app"
]

export const BOARD_TYPE = {
  PUBLIC: "public",
  PRIVATE: "private"
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT