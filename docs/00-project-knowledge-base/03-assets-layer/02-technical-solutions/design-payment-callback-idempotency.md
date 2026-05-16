# 支付回调幂等性设计

## 摘要

支付回调系统需要幂等性保证。当前微信支付重复回调导致重复处理，本方案使用 Redis 去重键解决。

## 方案

Redis 去重键，24h TTL，key 为 transaction_id + callback_type。
