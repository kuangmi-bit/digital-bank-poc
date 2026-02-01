# JMeter 性能测试框架

遵循 `technical-standards-v1.0`。性能目标：TPS ≥100，P95 &lt; 2s，错误率 &lt; 0.1%。

## 目录

- `test-plans/load-test.jmx` - 负载测试（线程、时长、阶梯可调）
- `test-plans/stress-test.jmx` - 压力测试

## 运行（需已安装 JMeter）

```bash
# 命令行
jmeter -n -t test-plans/load-test.jmx -l ../../reports/jmeter/load-result.jtl -e -o ../../reports/jmeter/html

# 覆盖参数示例
jmeter -n -t test-plans/load-test.jmx -JTHREADS=50 -JRAMP_UP=30 -JDURATION=600 -l ../../reports/jmeter/load.jtl
```

## 变量（Test Plan / -J）

| 变量 | 说明 | 默认 |
|------|------|------|
| THREADS | 并发线程 | 20 (load), 50 (stress) |
| RAMP_UP |  ramp-up(s) | 60 / 30 |
| DURATION | 持续时间(s)，load 专用 | 300 |
| LOOPS | 每线程迭代次数，stress 专用 | 100 |

## 环境

- 核心银行: localhost:8080  
- 支付: localhost:3001  
- 风控: localhost:8000  

修改 `HTTPSampler.domain` / `HTTPSampler.port` 可切环境。
