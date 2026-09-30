# PWNlemetry

You are an intelligence operative. Yesterday you intercepted a shredded slip of
paper from a courier who works for TeleMetrics, Inc., a glossy startup that
sells “smart telemetry” agents to datacenters. Inside the courier’s garbage you
found a USB stick and a single note: “PWNlemetry: reliable agent. Deploy
widely. Heartbeat to HQ.”

You loaded the stick and discovered a single binary. It looks legitimate: a
monitoring agent that can run as a client or a server. But you know how these
things go: companies that collect telemetry sometimes collect more than they
say. Your analysts believe TeleMetrics is quietly harvesting host inventories
from its clients and keeping them on centralized servers. If you can get the
list of monitored hosts from one of these servers, you might learn where
they’ve been deployed and what they’re watching.

Your mission, if you accept it: obtain the list of all monitored hosts from the
running PWNlemetry service.
