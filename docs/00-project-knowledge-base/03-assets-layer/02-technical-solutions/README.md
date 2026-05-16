# 02 technical solutions

## Documents

- [design-payment-callback-idempotency.md](design-payment-callback-idempotency.md): 支付系统回调幂等性设计方案
- [spec-session-connection-pool-optimization.md](spec-session-connection-pool-optimization.md): 登录接口在高并发下因 session 服务连接池耗尽返回 502，本提案将连接池从默认 10 调整至 50，并增加缓存降级逻辑。
