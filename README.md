# Trade Agent

A TypeScript-based trading agent utilizing Coinbase's CDP (Coinbase Developer Platform) and OpenAI's language models for automated trading strategies.

## Features

- Integration with Coinbase CDP for trading operations
- OpenAI-powered decision making
- TypeScript implementation for type safety
- Environment-based configuration
- Base Sepolia network support

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Coinbase CDP API credentials
- OpenAI API key

## Installation

1. Clone the repository:

git clone https://github.com/DzikuDev/TradeAgent.git

2. Install dependencies:

npm install

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your API credentials:
     - CDP_API_KEY_NAME
     - CDP_API_KEY_PRIVATE_KEY
     - OPENAI_API_KEY
     - NETWORK_ID

## Configuration

The project uses the following main dependencies:
- @coinbase/cdp-agentkit-core
- @coinbase/cdp-langchain
- @langchain/langgraph
- @langchain/openai
- TypeScript

## Development

To start development:

npm run dev

## Security

- Never commit your `.env` file
- Keep your API keys secure
- Rotate keys regularly
- Use test networks for development

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request