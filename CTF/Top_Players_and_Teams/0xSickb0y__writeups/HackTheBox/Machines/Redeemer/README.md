# Redeemer

> [https://app.hackthebox.com/starting-point?tier=0](https://app.hackthebox.com/starting-point?tier=0)

![CAPA](https://github.com/user-attachments/assets/c0d351b0-2bd8-4b2e-91d1-3b333a3bbe0e)

## Table of Contents

* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [Redis Database](#redis-database)
* [Conclusion](#conclusion)

## About

Redeemer served as an introductory challenge focused on database services and basic Redis commands. The machine guided enumeration toward the Redis key-value store running on the target, highlighting common Redis interactions and information disclosure.

## References

* [HackTricks: Redis](https://book.hacktricks.wiki/en/network-services-pentesting/6379-pentesting-redis.html)
* [Redis Security Best Practices](https://redis.io/docs/latest/operate/rs/security/recommended-security-practices/)
* [Redis Documentation: Commands](https://redis.io/commands/)
* [Nmap Script for Redis Enumeration](https://nmap.org/nsedoc/scripts/redis-info.html)
* [Redis Authentication and Access Control](https://redis.io/docs/latest/operate/rs/security/access-control/)

## Reconnaissance

An initial nmap scan using the Top 1024 ports revealed no open services. Expanding to a full port scan exposed port 6379 running _Redis 5.0.7_, a widely used key-value store.

![image](https://github.com/user-attachments/assets/e3bbfe96-f929-4434-95b0-3a7016a97306)

Redis is an open-source, in-memory key-value store that functions as a fast database, cache, and message broker. It supports various data structures and offers high performance for real-time applications due to its in-memory design.

## Redis Database

Using `redis-cli`, a connection to the Redis server was established. The `INFO` command provided detailed server metadata, including the Redis version, OS, process ID, and configuration details. The keyspace indicated 4 keys stored in database 0.

```bash
10.129.28.230:6379> info

# Server                                       
redis_version:5.0.7                            
redis_git_sha1:00000000   
redis_git_dirty:0                              
redis_build_id:66bd629f924ac924
redis_mode:standalone                          
os:Linux 5.4.0-77-generic x86_64
arch_bits:64                                   
multiplexing_api:epoll                         
atomicvar_api:atomic-builtin
gcc_version:9.3.0                              
process_id:750                                 
run_id:c579d561fb5524f51901af538c8b9e2d2b143ad5 
tcp_port:6379                                                                                 
uptime_in_seconds:947                          
uptime_in_days:0                               
hz:10               
configured_hz:10                               
lru_clock:3807635
executable:/usr/bin/redis-server
config_file:/etc/redis/redis.conf

[...]

# Keyspace
db0:keys=4,expires=0,avg_ttl=0
```
Further enumeration revealed the flag stored under the 3rd key, which was retrieved directly from the database.

![image-1](https://github.com/user-attachments/assets/f9bc5f9d-9ca4-4134-b757-9ff7bb545a1e)

## Conclusion

Redeemer emphasized the importance of recognizing default or exposed database services. Redis, when accessible without authentication, allows direct key inspection and data retrieval, which can expose sensitive information such as flags or credentials.
