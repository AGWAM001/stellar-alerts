# 📝 Pull Request

## 📌 Summary
This PR implements four major streaming and daemon features for the Stellar Alerts platform:

1. **GraphQL Subscription Endpoint (#440)**: Added Apollo Server with Redis Pub/Sub for real-time GraphQL subscriptions, enabling clients to stream filtered transaction and contract events over WebSockets.

2. **gRPC Streaming Interface (#441)**: Built an enterprise-grade gRPC streaming server with Proto3 definitions for ledger events, wallet alert subscriptions, and low-latency bidirectional notification feeds.

3. **Interactive TUI Dashboard (#444)**: Developed a React Ink terminal user interface showing live ingested transactions, queue depths, delivery latency, and worker status in real-time.

4. **Headless Daemon Mode (#445)**: Added a headless daemon mode to the CLI with automated service generation commands for systemd on Linux and launchd on macOS.

---

## 🔗 Related Issue(s)
Closes #440
Closes #441
Closes #444
Closes #445

---

## 🧪 Verification & Testing
Describe how your changes were verified:
- [x] Verified package.json dependency additions for Apollo Server, GraphQL, gRPC, Ink, and Commander
- [x] Checked TypeScript compilation with existing dependencies
- [x] Verified GraphQL schema and resolver structure follows Apollo Server patterns
- [x] Confirmed gRPC Proto3 definitions follow standard Protobuf format
- [x] Validated TUI dashboard component structure with React and Ink
- [x] Verified daemon service generation scripts produce valid systemd and launchd configurations
- [x] Updated README.md with comprehensive documentation for all new features
- [x] Added CLI scripts to package.json for easy access to new functionality

---

## 📸 Screenshots / Visual Proof (if applicable)
N/A - This is a backend infrastructure and CLI enhancement without UI changes.

---

## 📋 Implementation Details

### GraphQL Subscriptions
- Installed `@apollo/server`, `@as-integrations/fastify`, `graphql`, and `graphql-subscriptions`
- Created GraphQL schema with Payment, SorobanEvent, and SystemMetrics types
- Implemented resolvers with Redis Pub/Sub for real-time streaming
- Added WebSocket support for subscriptions at `/graphql` endpoint
- Supports filtering by wallet ID, asset, and minimum amount

### gRPC Streaming
- Installed `@grpc/grpc-js` and `@grpc/proto-loader`
- Created Proto3 definitions in `stellar.proto` for LedgerService
- Implemented streaming methods for ledger events and wallet alerts
- Added bidirectional streaming support for low-latency notifications
- gRPC server runs on port 50051 alongside the REST API
- Integrated with Redis Pub/Sub for event distribution

### TUI Dashboard
- Installed `ink`, `ink-table`, and `react` for terminal UI
- Created React-based dashboard with live payment monitoring
- Displays system metrics: queue depths, delivery latency, worker status
- Subscribes to Redis Pub/Sub for real-time updates
- Added `npm run cli:tui` command to launch the dashboard

### Headless Daemon Mode
- Installed `commander` for CLI argument parsing
- Created daemon CLI with headless mode for background processing
- Generates systemd service files for Linux deployment
- Generates launchd plist files for macOS deployment
- Added commands: `daemon:start`, `daemon:install:systemd`, `daemon:install:launchd`
- Supports automatic service registration and management

### Documentation Updates
- Updated README.md with new features
- Added GraphQL subscription usage examples
- Documented gRPC streaming interface
- Included TUI dashboard launch instructions
- Documented headless daemon mode setup for both Linux and macOS
- Updated CLI commands section with new options

---

## 🔧 Configuration Changes
- Updated `apps/api/package.json` with new dependencies
- Added new CLI scripts to package.json
- Updated `apps/api/src/app.ts` to register GraphQL routes
- Updated `apps/api/src/server.ts` to start gRPC server and handle shutdown
- Created new modules: `graphql/`, `grpc/`, and `cli/`

---

## 🚀 Usage Examples

### GraphQL Subscription
```graphql
subscription {
  paymentStream(filter: { walletId: "your-wallet-id" }) {
    id
    fromAddress
    amount
    asset
    receivedAt
  }
}
```

### gRPC Streaming
```bash
grpcurl -plaintext localhost:50051 stellar.LedgerService/StreamLedgerEvents
```

### TUI Dashboard
```bash
npm run cli:tui
```

### Daemon Mode
```bash
# Linux
npm run daemon:install:systemd
sudo systemctl daemon-reload
sudo systemctl enable stellar-alerts
sudo systemctl start stellar-alerts

# macOS
npm run daemon:install:launchd
launchctl load ~/Library/LaunchAgents/com.stellaralerts.daemon.plist
```
