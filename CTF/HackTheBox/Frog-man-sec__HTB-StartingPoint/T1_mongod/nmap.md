```terminal
22/tcp    open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 48:ad:d5:b8:3a:9f:bc:be:f7:e8:20:1e:f6:bf:de:ae (RSA)
|   256 b7:89:6c:0b:20:ed:49:b2:c1:86:7c:29:92:74:1c:1f (ECDSA)
|_  256 18:cd:9d:08:a6:21:a8:b8:b6:f7:9f:8d:40:51:54:fb (ED25519)
27017/tcp open  mongodb MongoDB 3.6.8 3.6.8
| mongodb-info: 
|   MongoDB Build info
|     versionArray
|       0 = 3
|       1 = 6
|       2 = 8
|       3 = 0
|     allocator = tcmalloc
|     sysInfo = deprecated
|     modules
|     version = 3.6.8
|     ok = 1.0
|     storageEngines
|       0 = devnull
|       1 = ephemeralForTest
|       2 = mmapv1
|       3 = wiredTiger
|     bits = 64
|     gitVersion = 8e540c0b6db93ce994cc548f000900bdc740f80a
|     debug = false
|     maxBsonObjectSize = 16777216
|     buildEnvironment
|       cc = cc: cc (Ubuntu 9.3.0-17ubuntu1~20.04) 9.3.0
|       target_os = linux
|       distmod = 
|       ccflags = -fno-omit-frame-pointer -fno-strict-aliasing -ggdb -pthread -Wall -Wsign-compare -Wno-unknown-pragmas -Wno-error=c++1z-compat -Wno-error=noexcept-type -Wno-error=format-truncation -Wno-error=int-in-bool-context -Winvalid-pch -O2 -Wno-unused-local-typedefs -Wno-unused-function -Wno-deprecated-declarations -Wno-unused-const-variable -Wno-unused-but-set-variable -Wno-missing-braces -Wno-format-truncation -fstack-protector-strong -fno-builtin-memcmp
|       linkflags = -Wl,-Bsymbolic-functions -Wl,-z,relro -pthread -Wl,-z,now -rdynamic -fstack-protector-strong -fuse-ld=gold -Wl,--build-id -Wl,--hash-style=gnu -Wl,-z,noexecstack -Wl,--warn-execstack -Wl,-z,relro
|       distarch = x86_64
|       target_arch = x86_64
|       cxxflags = -g -O2 -fdebug-prefix-map=/build/mongodb-FO9rLu/mongodb-3.6.9+really3.6.8+90~g8e540c0b6d=. -fstack-protector-strong -Wformat -Werror=format-security -Woverloaded-virtual -Wpessimizing-move -Wredundant-move -Wno-maybe-uninitialized -Wno-class-memaccess -std=c++14
|       cxx = g++: g++ (Ubuntu 9.3.0-17ubuntu1~20.04) 9.3.0
|     javascriptEngine = mozjs
|     openssl
|       compiled = OpenSSL 1.1.1f  31 Mar 2020
|       running = OpenSSL 1.1.1f  31 Mar 2020
|   Server status
|     mem
|       bits = 64
|       resident = 73
|       mappedWithJournal = 0
|       mapped = 0
|       virtual = 957
|       supported = true
|     logicalSessionRecordCache
|       lastTransactionReaperJobTimestamp = 1720073101230
|       lastTransactionReaperJobEntriesCleanedUp = 0
|       lastTransactionReaperJobDurationMillis = 0
|       lastSessionsCollectionJobCursorsClosed = 0
|       lastSessionsCollectionJobTimestamp = 1720074601237
|       lastSessionsCollectionJobEntriesRefreshed = 0
|       lastSessionsCollectionJobEntriesEnded = 0
|       activeSessionsCount = 0
|       transactionReaperJobCount = 0
|       sessionsCollectionJobCount = 6
|       lastSessionsCollectionJobDurationMillis = 0
|     host = mongod
|     asserts
|       user = 0
|       msg = 0
|       regular = 0
|       warning = 0
|       rollovers = 0
|     metrics
|       record
|         moves = 0
|       commands
|         lockInfo
|           total = 0
|           failed = 0
|         availableQueryOptions
|           total = 0
|           failed = 0
|         _recvChunkStatus
|           total = 0
|           failed = 0
|         moveChunk
|           total = 0
|           failed = 0
|         create
|           total = 0
|           failed = 0
|         killAllSessions
|           total = 0
|           failed = 0
|         fsync
|           total = 0
|           failed = 0
|         _configsvrUpdateZoneKeyRange
|           total = 0
|           failed = 0
|         splitVector
|           total = 0
|           failed = 0
|         dropRole
|           total = 0
|           failed = 0
|         ping
|           total = 0
|           failed = 0
|         aggregate
|           total = 0
|           failed = 0
|         rolesInfo
|           total = 0
|           failed = 0
|         replSetElect
|           total = 0
|           failed = 0
|         <UNKNOWN> = 0
|         eval
|           total = 0
|           failed = 0
|         connectionStatus
|           total = 0
|           failed = 0
|         createIndexes
|           total = 6
|           failed = 0
|         killSessions
|           total = 0
|           failed = 0
|         distinct
|           total = 0
|           failed = 0
|         appendOplogNote
|           total = 0
|           failed = 0
|         reIndex
|           total = 0
|           failed = 0
|         getPrevError
|           total = 0
|           failed = 0
|         clone
|           total = 0
|           failed = 0
|         currentOp
|           total = 0
|           failed = 0
|         features
|           total = 0
|           failed = 0
|         hostInfo
|           total = 0
|           failed = 0
|         shutdown
|           total = 0
|           failed = 0
|         getLog
|           total = 0
|           failed = 0
|         find
|           total = 1
|           failed = 0
|         getnonce
|           total = 0
|           failed = 0
|         mergeChunks
|           total = 0
|           failed = 0
|         getLastError
|           total = 0
|           failed = 0
|         isMaster
|           total = 0
|           failed = 0
|         grantRolesToUser
|           total = 0
|           failed = 0
|         _configsvrRemoveShard
|           total = 0
|           failed = 0
|         copydb
|           total = 0
|           failed = 0
|         forceerror
|           total = 0
|           failed = 0
|         _migrateClone
|           total = 0
|           failed = 0
|         connPoolStats
|           total = 0
|           failed = 0
|         explain
|           total = 0
|           failed = 0
|         grantPrivilegesToRole
|           total = 0
|           failed = 0
|         revokePrivilegesFromRole
|           total = 0
|           failed = 0
|         startSession
|           total = 0
|           failed = 0
|         renameCollection
|           total = 0
|           failed = 0
|         _getUserCacheGeneration
|           total = 0
|           failed = 0
|         unsetSharding
|           total = 0
|           failed = 0
|         profile
|           total = 0
|           failed = 0
|         getShardMap
|           total = 0
|           failed = 0
|         refreshSessions
|           total = 0
|           failed = 0
|         _configsvrCommitChunkMerge
|           total = 0
|           failed = 0
|         getShardVersion
|           total = 0
|           failed = 0
|         collStats
|           total = 0
|           failed = 0
|         copydbgetnonce
|           total = 0
|           failed = 0
|         fsyncUnlock
|           total = 0
|           failed = 0
|         filemd5
|           total = 0
|           failed = 0
|         dropAllRolesFromDatabase
|           total = 0
|           failed = 0
|         _configsvrBalancerStop
|           total = 0
|           failed = 0
|         compact
|           total = 0
|           failed = 0
|         findAndModify
|           total = 0
|           failed = 0
|         replSetReconfig
|           total = 0
|           failed = 0
|         replSetStepUp
|           total = 0
|           failed = 0
|         insert
|           total = 0
|           failed = 0
|         grantRolesToRole
|           total = 0
|           failed = 0
|         _configsvrCommitChunkMigration
|           total = 0
|           failed = 0
|         updateUser
|           total = 0
|           failed = 0
|         _transferMods
|           total = 0
|           failed = 0
|         geoNear
|           total = 0
|           failed = 0
|         getDiagnosticData
|           total = 0
|           failed = 0
|         _configsvrRemoveShardFromZone
|           total = 0
|           failed = 0
|         _getNextSessionMods
|           total = 0
|           failed = 0
|         refreshSessionsInternal
|           total = 0
|           failed = 0
|         collMod
|           total = 0
|           failed = 0
|         cloneCollectionAsCapped
|           total = 0
|           failed = 0
|         killCursors
|           total = 0
|           failed = 0
|         cleanupOrphaned
|           total = 0
|           failed = 0
|         dropAllUsersFromDatabase
|           total = 0
|           failed = 0
|         replSetGetConfig
|           total = 0
|           failed = 0
|         _configsvrBalancerStatus
|           total = 0
|           failed = 0
|         checkShardingIndex
|           total = 0
|           failed = 0
|         whatsmyuri
|           total = 0
|           failed = 0
|         planCacheClear
|           total = 0
|           failed = 0
|         authenticate
|           total = 0
|           failed = 0
|         validate
|           total = 0
|           failed = 0
|         getMore
|           total = 0
|           failed = 0
|         drop
|           total = 0
|           failed = 0
|         usersInfo
|           total = 0
|           failed = 0
|         serverStatus
|           total = 2
|           failed = 0
|         buildInfo
|           total = 0
|           failed = 0
|         _flushRoutingTableCacheUpdates
|           total = 0
|           failed = 0
|         update
|           total = 0
|           failed = 0
|         driverOIDTest
|           total = 0
|           failed = 0
|         _configsvrCreateDatabase
|           total = 0
|           failed = 0
|         group
|           total = 0
|           failed = 0
|         _mergeAuthzCollections
|           total = 0
|           failed = 0
|         _configsvrMovePrimary
|           total = 0
|           failed = 0
|         parallelCollectionScan
|           total = 0
|           failed = 0
|         touch
|           total = 0
|           failed = 0
|         top
|           total = 0
|           failed = 0
|         splitChunk
|           total = 0
|           failed = 0
|         replSetSyncFrom
|           total = 0
|           failed = 0
|         replSetAbortPrimaryCatchUp
|           total = 0
|           failed = 0
|         replSetGetRBID
|           total = 0
|           failed = 0
|         shardingState
|           total = 0
|           failed = 0
|         replSetFresh
|           total = 0
|           failed = 0
|         dbStats
|           total = 0
|           failed = 0
|         setShardVersion
|           total = 0
|           failed = 0
|         setParameter
|           total = 0
|           failed = 0
|         dropIndexes
|           total = 0
|           failed = 0
|         setFeatureCompatibilityVersion
|           total = 0
|           failed = 0
|         replSetResizeOplog
|           total = 0
|           failed = 0
|         updateRole
|           total = 0
|           failed = 0
|         dataSize
|           total = 0
|           failed = 0
|         saslStart
|           total = 0
|           failed = 0
|         logRotate
|           total = 0
|           failed = 0
|         convertToCapped
|           total = 0
|           failed = 0
|         saslContinue
|           total = 0
|           failed = 0
|         endSessions
|           total = 0
|           failed = 0
|         revokeRolesFromUser
|           total = 0
|           failed = 0
|         revokeRolesFromRole
|           total = 0
|           failed = 0
|         resync
|           total = 0
|           failed = 0
|         authSchemaUpgrade
|           total = 0
|           failed = 0
|         resetError
|           total = 0
|           failed = 0
|         _recvChunkCommit
|           total = 0
|           failed = 0
|         killAllSessionsByPattern
|           total = 0
|           failed = 0
|         planCacheListQueryShapes
|           total = 0
|           failed = 0
|         _recvChunkAbort
|           total = 0
|           failed = 0
|         _isSelf
|           total = 0
|           failed = 0
|         delete
|           total = 0
|           failed = 0
|         replSetStepDown
|           total = 0
|           failed = 0
|         planCacheListFilters
|           total = 0
|           failed = 0
|         replSetMaintenance
|           total = 0
|           failed = 0
|         getCmdLineOpts
|           total = 0
|           failed = 0
|         count
|           total = 0
|           failed = 0
|         replSetInitiate
|           total = 0
|           failed = 0
|         replSetHeartbeat
|           total = 0
|           failed = 0
|         replSetGetStatus
|           total = 0
|           failed = 0
|         mapreduce
|           shardedfinish
|             total = 0
|             failed = 0
|         mapReduce
|           total = 0
|           failed = 0
|         listCollections
|           total = 0
|           failed = 0
|         getParameter
|           total = 0
|           failed = 0
|         _configsvrCommitChunkSplit
|           total = 0
|           failed = 0
|         planCacheSetFilter
|           total = 0
|           failed = 0
|         planCacheClearFilters
|           total = 0
|           failed = 0
|         planCacheListPlans
|           total = 0
|           failed = 0
|         shardConnPoolStats
|           total = 0
|           failed = 0
|         replSetFreeze
|           total = 0
|           failed = 0
|         cloneCollection
|           total = 0
|           failed = 0
|         _configsvrMoveChunk
|           total = 0
|           failed = 0
|         repairDatabase
|           total = 0
|           failed = 0
|         repairCursor
|           total = 0
|           failed = 0
|         logout
|           total = 0
|           failed = 0
|         listIndexes
|           total = 0
|           failed = 0
|         _configsvrEnableSharding
|           total = 0
|           failed = 0
|         listCommands
|           total = 0
|           failed = 0
|         replSetUpdatePosition
|           total = 0
|           failed = 0
|         _configsvrShardCollection
|           total = 0
|           failed = 0
|         dropUser
|           total = 0
|           failed = 0
|         invalidateUserCache
|           total = 0
|           failed = 0
|         _recvChunkStart
|           total = 0
|           failed = 0
|         dropDatabase
|           total = 0
|           failed = 0
|         connPoolSync
|           total = 0
|           failed = 0
|         _configsvrAddShard
|           total = 0
|           failed = 0
|         copydbsaslstart
|           total = 0
|           failed = 0
|         handshake
|           total = 0
|           failed = 0
|         _configsvrBalancerStart
|           total = 0
|           failed = 0
|         createUser
|           total = 0
|           failed = 0
|         killOp
|           total = 0
|           failed = 0
|         createRole
|           total = 0
|           failed = 0
|         applyOps
|           total = 0
|           failed = 0
|         listDatabases
|           total = 1
|           failed = 0
|         dbHash
|           total = 0
|           failed = 0
|         _configsvrAddShardToZone
|           total = 0
|           failed = 0
|         geoSearch
|           total = 0
|           failed = 0
|         replSetRequestVotes
|           total = 0
|           failed = 0
|       cursor
|         open
|           total = 0
|           noTimeout = 0
|           pinned = 0
|         timedOut = 0
|       document
|         updated = 0
|         inserted = 0
|         deleted = 0
|         returned = 0
|       ttl
|         passes = 27
|         deletedDocuments = 0
|       storage
|         freelist
|           search
|             scanned = 0
|             bucketExhausted = 0
|             requests = 0
|       getLastError
|         wtimeouts = 0
|         wtime
|           num = 0
|           totalMillis = 0
|       repl
|         preload
|           indexes
|             num = 0
|             totalMillis = 0
|           docs
|             num = 0
|             totalMillis = 0
|         initialSync
|           failedAttempts = 0
|           failures = 0
|           completed = 0
|         executor
|           shuttingDown = false
|           pool
|             inProgressCount = 0
|           queues
|             networkInProgress = 0
|             sleepers = 0
|           networkInterface = 
|           NetworkInterfaceASIO Operations' Diagnostic:
|           Operation:    Count:   
|           Connecting    0        
|           In Progress   0        
|           Succeeded     0        
|           Canceled      0        
|           Failed        0        
|           Timed Out     0        
|           
|           unsignaledEvents = 0
|         apply
|           attemptsToBecomeSecondary = 0
|           batches
|             num = 0
|             totalMillis = 0
|           ops = 0
|         network
|           bytes = 0
|           ops = 0
|           readersCreated = 0
|           getmores
|             num = 0
|             totalMillis = 0
|         buffer
|           maxSizeBytes = 0
|           sizeBytes = 0
|           count = 0
|       queryExecutor
|         scannedObjects = 0
|         scanned = 0
|       operation
|         scanAndOrder = 0
|         writeConflicts = 0
|     uptimeEstimate = 1658
|     locks
|       Database
|         acquireCount
|           W = 8
|           R = 5
|           r = 2167
|           w = 39
|       Collection
|         acquireCount
|           r = 2162
|           w = 33
|       Global
|         acquireCount
|           W = 5
|           r = 6056
|           w = 47
|     uptimeMillis = 1658242
|     wiredTiger
|       transaction
|         set timestamp stable updates = 0
|         transaction fsync duration for checkpoint after allocating the transaction ID (usecs) = 0
|         transaction sync calls = 0
|         number of named snapshots dropped = 0
|         transaction failures due to cache overflow = 0
|         transaction begins = 65
|         transaction range of timestamps pinned by the oldest timestamp = 0
|         transaction checkpoint most recent time (msecs) = 0
|         transaction checkpoint generation = 29
|         transaction checkpoint max time (msecs) = 14
|         transaction checkpoint currently running = 0
|         transaction checkpoint total time (msecs) = 34
|         set timestamp stable calls = 0
|         read timestamp queue length = 0
|         commit timestamp queue length = 0
|         transaction range of IDs currently pinned by named snapshots = 0
|         transaction range of timestamps currently pinned = 0
|         prepared transactions currently active = 0
|         update conflicts = 0
|         transactions rolled back = 63
|         transactions committed = 2
|         transaction range of IDs currently pinned by a checkpoint = 0
|         transaction range of IDs currently pinned = 0
|         prepared transactions = 0
|         transaction fsync calls for checkpoint after allocating the transaction ID = 28
|         transaction checkpoints skipped because database was clean = 0
|         rollback to stable calls = 0
|         transaction checkpoint scrub time (msecs) = 0
|         transaction checkpoint min time (msecs) = 0
|         read timestamp queue insert to empty = 0
|         query timestamp calls = 6915
|         set timestamp calls = 0
|         commit timestamp queue inserts total = 0
|         read timestamp queue inserts total = 0
|         transaction checkpoint scrub dirty target = 0
|         transaction checkpoints = 28
|         rollback to stable updates aborted = 0
|         prepared transactions rolled back = 0
|         rollback to stable updates removed from lookaside = 0
|         read timestamp queue inserts to head = 0
|         set timestamp commit updates = 0
|         set timestamp oldest updates = 0
|         commit timestamp queue inserts to tail = 0
|         commit timestamp queue insert to empty = 0
|         prepared transactions committed = 0
|         number of named snapshots created = 0
|         set timestamp oldest calls = 0
|         set timestamp commit calls = 0
|       perf
|         file system read latency histogram (bucket 2) - 50-99ms = 3
|         file system read latency histogram (bucket 1) - 10-49ms = 3
|         file system write latency histogram (bucket 1) - 10-49ms = 0
|         operation read latency histogram (bucket 1) - 100-249us = 0
|         operation read latency histogram (bucket 3) - 500-999us = 0
|         operation read latency histogram (bucket 4) - 1000-9999us = 0
|         operation write latency histogram (bucket 3) - 500-999us = 0
|         file system read latency histogram (bucket 4) - 250-499ms = 0
|         operation write latency histogram (bucket 1) - 100-249us = 0
|         operation read latency histogram (bucket 2) - 250-499us = 0
|         file system write latency histogram (bucket 4) - 250-499ms = 0
|         file system read latency histogram (bucket 6) - 1000ms+ = 0
|         file system write latency histogram (bucket 6) - 1000ms+ = 0
|         file system write latency histogram (bucket 2) - 50-99ms = 0
|         operation write latency histogram (bucket 5) - 10000us+ = 0
|         operation write latency histogram (bucket 4) - 1000-9999us = 0
|         file system write latency histogram (bucket 3) - 100-249ms = 0
|         file system read latency histogram (bucket 5) - 500-999ms = 0
|         operation write latency histogram (bucket 2) - 250-499us = 1
|         operation read latency histogram (bucket 5) - 10000us+ = 0
|         file system write latency histogram (bucket 5) - 500-999ms = 0
|         file system read latency histogram (bucket 3) - 100-249ms = 0
|       LSM
|         merge work units currently queued = 0
|         sleep for LSM checkpoint throttle = 0
|         tree maintenance operations scheduled = 0
|         tree maintenance operations discarded = 0
|         application work units currently queued = 0
|         switch work units currently queued = 0
|         rows merged in an LSM tree = 0
|         tree queue hit maximum = 0
|         sleep for LSM merge throttle = 0
|         tree maintenance operations executed = 0
|       thread-state
|         active filesystem fsync calls = 0
|         active filesystem read calls = 0
|         active filesystem write calls = 0
|       connection
|         auto adjusting condition wait calls = 10226
|         pthread mutex condition wait calls = 27596
|         files currently open = 15
|         auto adjusting condition resets = 125
|         detected system time went backwards = 0
|         total write I/Os = 63
|         memory allocations = 29516
|         memory re-allocations = 5117
|         total fsync I/Os = 79
|         memory frees = 28556
|         pthread mutex shared lock write-lock calls = 1822
|         pthread mutex shared lock read-lock calls = 11693
|         total read I/Os = 1306
|       thread-yield
|         data handle lock yielded = 0
|         application thread time evicting (usecs) = 0
|         get reference for page index and slot time sleeping (usecs) = 0
|         page acquire busy blocked = 0
|         page reconciliation yielded due to child modification = 0
|         page acquire locked blocked = 0
|         page acquire read blocked = 0
|         connection close yielded for lsm manager shutdown = 0
|         page acquire time sleeping (usecs) = 0
|         connection close blocked waiting for transaction state stabilization = 0
|         page acquire eviction blocked = 0
|         page delete rollback time sleeping for state change (usecs) = 0
|         page access yielded due to prepare state change = 0
|         log server sync yielded for log write = 0
|         application thread time waiting for cache (usecs) = 0
|       session
|         table rename successful calls = 0
|         table alter unchanged and skipped = 0
|         table verify successful calls = 0
|         table rebalance failed calls = 0
|         table compact successful calls = 0
|         table create successful calls = 1
|         table drop successful calls = 0
|         table verify failed calls = 0
|         table salvage successful calls = 0
|         table truncate successful calls = 0
|         table salvage failed calls = 0
|         table rename failed calls = 0
|         table truncate failed calls = 0
|         open session count = 19
|         open cursor count = 35
|         table alter failed calls = 0
|         table compact failed calls = 0
|         table drop failed calls = 0
|         table alter successful calls = 0
|         table create failed calls = 0
|         table rebalance successful calls = 0
|       log
|         maximum log file size = 104857600
|         log force write operations skipped = 18191
|         pre-allocated log files prepared = 2
|         log records too small to compress = 34
|         log sync_dir operations = 1
|         slot join calls atomic updates raced = 0
|         slot close lost race = 0
|         slot join atomic update races = 0
|         records processed by log scan = 13
|         slot join calls did not yield = 39
|         pre-allocated log files not ready and missed = 1
|         total log buffer size = 33554432
|         log records compressed = 5
|         number of pre-allocated log files to create = 2
|         log records not compressed = 0
|         pre-allocated log files used = 0
|         force archive time sleeping (usecs) = 0
|         log sync time duration (usecs) = 32886
|         logging bytes consolidated = 8960
|         log force write operations = 18218
|         slot closures = 32
|         yields waiting for previous log file close = 0
|         slot join calls yielded = 0
|         log scan records requiring two reads = 0
|         total in-memory size of compressed records = 6456
|         slot join found active slot closed = 0
|         slot transitions unable to find free slot = 0
|         log server thread write LSN walk skipped = 2631
|         log bytes of payload data = 4953
|         log flush operations = 16539
|         slot close unbuffered waits = 0
|         log files manually zero-filled = 0
|         slot unbuffered writes = 0
|         slot joins yield time (usecs) = 0
|         log server thread advances write LSN = 27
|         written slots coalesced = 0
|         log scan operations = 6
|         slot join calls found active slot closed = 0
|         total size of compressed records = 4277
|         log sync operations = 32
|         slot join calls slept = 0
|         log write operations = 39
|         log release advances write LSN = 5
|         log sync_dir time duration (usecs) = 31086
|         log bytes written = 9472
|         busy returns attempting to switch slots = 0
|       lock
|         txn global write lock acquisitions = 60
|         dhandle lock application thread time waiting for the dhandle lock (usecs) = 0
|         read timestamp queue write lock acquisitions = 0
|         dhandle write lock acquisitions = 28
|         commit timestamp queue write lock acquisitions = 0
|         txn global lock application thread time waiting for the dhandle lock (usecs) = 0
|         metadata lock application thread wait time (usecs) = 0
|         commit timestamp queue lock application thread time waiting for the dhandle lock (usecs) = 0
|         table read lock acquisitions = 0
|         txn global read lock acquisitions = 42
|         dhandle read lock acquisitions = 6887
|         table write lock acquisitions = 12
|         schema lock application thread wait time (usecs) = 0
|         checkpoint lock acquisitions = 28
|         commit timestamp queue read lock acquisitions = 0
|         commit timestamp queue lock internal thread time waiting for the dhandle lock (usecs) = 0
|         schema lock internal thread wait time (usecs) = 0
|         read timestamp queue read lock acquisitions = 0
|         table lock internal thread time waiting for the table lock (usecs) = 0
|         read timestamp queue lock application thread time waiting for the dhandle lock (usecs) = 0
|         schema lock acquisitions = 52
|         metadata lock internal thread wait time (usecs) = 0
|         txn global lock internal thread time waiting for the dhandle lock (usecs) = 0
|         table lock application thread time waiting for the table lock (usecs) = 0
|         metadata lock acquisitions = 28
|         checkpoint lock application thread wait time (usecs) = 0
|         dhandle lock internal thread time waiting for the dhandle lock (usecs) = 0
|         checkpoint lock internal thread wait time (usecs) = 0
|         read timestamp queue lock internal thread time waiting for the dhandle lock (usecs) = 0
|       cursor
|         cursors cached on close = 0
|         cursor create calls = 38
|         cursor search calls = 632
|         cursor prev calls = 33
|         cursor sweep buckets = 0
|         cursor update calls = 0
|         cursor search near calls = 28
|         cursors reused from cache = 0
|         cursor sweep cursors examined = 0
|         cursor reserve calls = 0
|         truncate calls = 0
|         cursor restarted searches = 0
|         cursor next calls = 99
|         cursor sweep cursors closed = 0
|         cursor remove calls = 1
|         cursor insert calls = 12
|         cursor modify calls = 0
|         cursor reset calls = 923
|         cursor sweeps = 0
|       reconciliation
|         split objects currently awaiting free = 0
|         page reconciliation calls for eviction = 0
|         pages deleted = 0
|         split bytes currently awaiting free = 0
|         fast-path pages deleted = 0
|         page reconciliation calls = 11
|       concurrentTransactions
|         write
|           out = 0
|           totalTickets = 128
|           available = 128
|         read
|           out = 1
|           totalTickets = 128
|           available = 127
|       uri = statistics:
|       async
|         total allocations = 0
|         number of flush calls = 0
|         current work queue length = 0
|         number of times operation allocation failed = 0
|         number of times worker found no work = 0
|         total search calls = 0
|         total update calls = 0
|         maximum work queue length = 0
|         number of operation slots viewed for allocation = 0
|         number of allocation state races = 0
|         total remove calls = 0
|         total insert calls = 0
|         total compact calls = 0
|       block-manager
|         mapped blocks read = 0
|         mapped bytes read = 0
|         blocks written = 23
|         blocks read = 31
|         bytes written for checkpoint = 126976
|         bytes read = 143360
|         blocks pre-loaded = 9
|         bytes written = 126976
|       cache
|         internal pages split during eviction = 0
|         eviction currently operating in aggressive mode = 0
|         pages read into cache = 18
|         lookaside table entries = 0
|         bytes written from cache = 67128
|         eviction walks abandoned = 0
|         hazard pointer check entries walked = 0
|         eviction empty score = 0
|         force re-tuning of eviction workers once in a while = 0
|         eviction server unable to reach eviction goal = 0
|         pages currently held in the cache = 22
|         pages evicted because they had chains of deleted items time (usecs) = 0
|         pages written requiring in-memory restoration = 0
|         eviction worker thread active = 4
|         eviction walks gave up because they saw too many pages and found too few candidates = 0
|         eviction walks gave up because they saw too many pages and found no candidates = 0
|         eviction calls to get a page = 0
|         leaf pages split during eviction = 0
|         pages read into cache requiring lookaside for checkpoint = 0
|         lookaside score = 0
|         application threads page read from disk to cache count = 8
|         tracked bytes belonging to internal pages in the cache = 3398
|         checkpoint blocked page eviction = 0
|         eviction walk target pages histogram - 128 and higher = 0
|         pages read into cache after truncate in prepare state = 0
|         eviction worker thread stable number = 0
|         eviction walks started from saved location in tree = 0
|         hazard pointer check calls = 0
|         unmodified pages evicted = 0
|         hazard pointer maximum array length = 0
|         tracked dirty pages in the cache = 0
|         tracked dirty bytes in the cache = 0
|         eviction walk target pages histogram - 0-9 = 0
|         tracked bytes belonging to leaf pages in the cache = 69152
|         pages evicted because they exceeded the in-memory maximum time (usecs) = 0
|         page split during eviction deepened the tree = 0
|         bytes read into cache = 53696
|         pages written from cache = 11
|         pages walked for eviction = 0
|         pages selected for eviction unable to be evicted = 0
|         pages seen by eviction walk = 0
|         pages requested from the cache = 976
|         modified pages evicted by application threads = 0
|         pages read into cache with skipped lookaside entries needed later by checkpoint = 0
|         eviction passes of a file = 0
|         pages queued for eviction = 0
|         pages read into cache skipping older lookaside entries = 0
|         pages read into cache requiring lookaside entries = 0
|         eviction server evicting pages = 0
|         pages queued for urgent eviction during walk = 0
|         eviction state = 32
|         failed eviction of pages that exceeded the in-memory maximum count = 0
|         pages queued for urgent eviction = 0
|         in-memory page passed criteria to be split = 0
|         eviction walk target pages histogram - 32-63 = 0
|         pages read into cache with skipped lookaside entries needed later = 0
|         eviction server candidate queue empty when topping up = 0
|         pages evicted because they exceeded the in-memory maximum count = 0
|         application threads page write from cache to disk time (usecs) = 463
|         pages evicted by application threads = 0
|         eviction walks reached end of tree = 0
|         pages evicted because they had chains of deleted items count = 0
|         percentage overhead = 8
|         application threads page write from cache to disk count = 10
|         eviction worker thread removed = 0
|         page written requiring lookaside records = 0
|         overflow pages read into cache = 0
|         eviction worker thread created = 0
|         pages read into cache after truncate = 1
|         lookaside table insert calls = 0
|         eviction server candidate queue not empty when topping up = 0
|         lookaside table remove calls = 0
|         maximum page size at eviction = 0
|         modified pages evicted = 0
|         eviction calls to get a page found queue empty after locking = 0
|         eviction calls to get a page found queue empty = 0
|         bytes belonging to page images in the cache = 57991
|         bytes belonging to the lookaside table in the cache = 182
|         hazard pointer blocked page eviction = 0
|         failed eviction of pages that exceeded the in-memory maximum time (usecs) = 0
|         eviction walks gave up because they restarted their walk twice = 0
|         maximum bytes configured = 502267904
|         eviction worker thread evicting pages = 0
|         eviction walks started from root of tree = 0
|         bytes currently in the cache = 72550
|         eviction server slept, because we did not make progress with eviction = 0
|         eviction walk target pages histogram - 64-128 = 0
|         application threads page read from disk to cache time (usecs) = 1256
|         eviction walk target pages histogram - 10-31 = 0
|         bytes not belonging to page images in the cache = 14558
|         in-memory page splits = 0
|         files with active eviction walks = 0
|         internal pages evicted = 0
|         files with new eviction walks started = 0
|       data-handle
|         session sweep attempts = 19
|         session dhandles swept = 0
|         connection sweep dhandles closed = 0
|         connection sweeps = 824
|         connection sweep time-of-death sets = 13
|         connection sweep candidate became referenced = 0
|         connection sweep dhandles removed from hash list = 3
|         connection data handles currently active = 22
|     tcmalloc
|       generic
|         heap_size = 73154560
|         current_allocated_bytes = 67900712
|       tcmalloc
|         pageheap_unmapped_bytes = 0
|         total_free_bytes = 2583256
|         transfer_cache_free_bytes = 167936
|         thread_cache_free_bytes = 1837144
|         current_total_thread_cache_bytes = 1837144
|         pageheap_total_decommit_bytes = 0
|         central_cache_free_bytes = 578176
|         pageheap_scavenge_count = 0
|         pageheap_total_commit_bytes = 73154560
|         aggressive_memory_decommit = 0
|         pageheap_reserve_count = 48
|         pageheap_free_bytes = 2670592
|         pageheap_decommit_count = 0
|         max_total_thread_cache_bytes = 258998272
|         pageheap_commit_count = 48
|         pageheap_committed_bytes = 73154560
|         pageheap_total_reserve_bytes = 73154560
|         formattedString = ------------------------------------------------
|         MALLOC:       67901288 (   64.8 MiB) Bytes in use by application
|         MALLOC: +      2670592 (    2.5 MiB) Bytes in page heap freelist
|         MALLOC: +       578176 (    0.6 MiB) Bytes in central cache freelist
|         MALLOC: +       167936 (    0.2 MiB) Bytes in transfer cache freelist
|         MALLOC: +      1836568 (    1.8 MiB) Bytes in thread cache freelists
|         MALLOC: +      2752512 (    2.6 MiB) Bytes in malloc metadata
|         MALLOC:   ------------
|         MALLOC: =     75907072 (   72.4 MiB) Actual memory used (physical + swap)
|         MALLOC: +            0 (    0.0 MiB) Bytes released to OS (aka unmapped)
|         MALLOC:   ------------
|         MALLOC: =     75907072 (   72.4 MiB) Virtual address space used
|         MALLOC:
|         MALLOC:            509              Spans in use
|         MALLOC:             18              Thread heaps in use
|         MALLOC:           8192              Tcmalloc page size
|         ------------------------------------------------
|         Call ReleaseFreeMemory() to release freelist memory to the OS (via madvise()).
|         Bytes released to the OS take up virtual address space but no physical memory.
|     ok = 1.0
|     transportSecurity
|       1.2 = 0
|       1.0 = 0
|       1.1 = 0
|     pid = 843
|     network
|       physicalBytesIn = 189
|       compression
|         snappy
|           decompressor
|             bytesIn = 0
|             bytesOut = 0
|           compressor
|             bytesIn = 0
|             bytesOut = 0
|       numRequests = 3
|       serviceExecutorTaskStats
|         threadsRunning = 2
|         executor = passthrough
|       bytesOut = 30223
|       bytesIn = 189
|       physicalBytesOut = 30223
|     opcountersRepl
|       delete = 0
|       getmore = 0
|       command = 0
|       insert = 0
|       query = 0
|       update = 0
|     version = 3.6.8
|     storageEngine
|       readOnly = false
|       supportsCommittedReads = true
|       name = wiredTiger
|       persistent = true
|     opLatencies
|       writes
|         ops = 0
|         latency = 0
|       commands
|         ops = 2
|         latency = 824
|       reads
|         ops = 0
|         latency = 0
|     opcounters
|       delete = 0
|       getmore = 0
|       command = 9
|       insert = 0
|       query = 1
|       update = 0
|     transactions
|       retriedCommandsCount = 0
|       retriedStatementsCount = 0
|       transactionsCollectionWriteCount = 0
|     uptime = 1658.0
|     localTime = 1720074757315
|     connections
|       totalCreated = 3
|       current = 2
|       available = 51198
|     process = mongod
|     globalLock
|       activeClients
|         total = 11
|         readers = 0
|         writers = 0
|       totalTime = 1657924000
|       currentQueue
|         total = 0
|         readers = 0
|         writers = 0
|     extra_info
|       page_faults = 268
|_      note = fields vary by platform
| mongodb-databases: 
|   ok = 1.0
|   databases
|     4
|       sizeOnDisk = 32768.0
|       name = users
|       empty = false
|     0
|       sizeOnDisk = 32768.0
|       name = admin
|       empty = false
|     1
|       sizeOnDisk = 73728.0
|       name = config
|       empty = false
|     2
|       sizeOnDisk = 73728.0
|       name = local
|       empty = false
|     3
|       sizeOnDisk = 32768.0
|       name = sensitive_information
|       empty = false
|_  totalSize = 245760.0
```