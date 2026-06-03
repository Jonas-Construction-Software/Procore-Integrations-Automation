
/**
 * Application Configuration
 * 
 * Environment is determined by the EnvName environment variable.
 * Add your project's environments to the switch cases below.
 * 
 * For sensitive values (passwords, tokens), prefer using environment variables
 * or a .env file (excluded via .gitignore) instead of hardcoding.
 */
export const AppConfig = {
  get EnvName() {
    return (process.env.EnvName || "qa").toLowerCase();
  },

  get BaseURL() {
    switch (this.EnvName) {
      case "qa":
        return process.env.BASE_URL || "https://your-app-qa.example.com";
      case "staging":
        return process.env.BASE_URL || "https://your-app-staging.example.com";
      default:
        return process.env.BASE_URL || "https://your-app-qa.example.com";
    }
  },

  get UserName() {
    return process.env.TEST_USERNAME || "testuser";
  },

  get Password() {
    return process.env.TEST_PASSWORD || "testpassword";
  },

  get SecondUserName() {
    return process.env.TEST_SECOND_USERNAME || "testuser2";
  },

  get SecondUserPassword() {
    return process.env.TEST_SECOND_PASSWORD || "testpassword2";
  },
  };