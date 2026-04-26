db-1        | 2026-04-26 02:47:19.261 UTC [62] FATAL:  connection to client lost


api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 514, in _prepare_and_execute
api-1       |     prepared_stmt, attributes = await adapt_connection._prepare(
api-1       |                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 765, in _prepare
api-1       |     prepared_stmt = await self._connection.prepare(
api-1       |                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 636, in prepare
api-1       |     return await self._prepare(
api-1       |            ^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 654, in _prepare
api-1       |     stmt = await self._get_statement(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 433, in _get_statement
api-1       |     statement = await self._protocol.prepare(
api-1       |                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "asyncpg/protocol/protocol.pyx", line 166, in prepare
api-1       | asyncpg.exceptions.UndefinedColumnError: column indicators.severity does not exist
api-1       | 
api-1       | The above exception was the direct cause of the following exception:
api-1       | 
api-1       | Traceback (most recent call last):
db-1        | 2026-04-26 02:47:19.514 UTC [61] ERROR:  column indicators.severity does not exist at character 84


db-1        | 2026-04-26 02:47:19.514 UTC [61] STATEMENT:  SELECT indicators.id, indicators.indicator_type, indicators.value, indicators.tlp, indicators.severity, indicators.confidence, indicators.country_codes, indicators.sectors, indicators.attack_categories, indicators.description, indicators.first_seen, indicators.last_seen, indicators.enrichment_data, indicators.submitted_by, indicators.stix_id, indicators.status, ind



api-1       |     self.dialect.do_execute(
db-1        |   FROM indicators ORDER BY indicators.created_at DESC 


db-1        |    LIMIT $1::INTEGER OFFSET $2::INTEGER
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/default.py", line 924, in do_execute
api-1       |     cursor.execute(statement, parameters)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 572, in execute
api-1       |     self._adapt_connection.await_(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 131, in await_only
api-1       |     return current.driver.switch(awaitable)  # type: ignore[no-any-return]
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 196, in greenlet_spawn
api-1       |     value = await result
api-1       |             ^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 550, in _prepare_and_execute
api-1       |     self._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 501, in _handle_exception
api-1       |     self._adapt_connection._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 789, in _handle_exception
api-1       |     raise translated_error from error
api-1       | sqlalchemy.dialects.postgresql.asyncpg.AsyncAdapt_asyncpg_dbapi.ProgrammingError: <class 'asyncpg.exceptions.UndefinedColumnError'>: column indicators.severity does not exist
api-1       | 
api-1       | The above exception was the direct cause of the following exception:
api-1       | 
api-1       | Traceback (most recent call last):
api-1       |   File "/usr/local/lib/python3.11/site-packages/uvicorn/protocols/http/httptools_impl.py", line 399, in run_asgi
api-1       |     result = await app(  # type: ignore[func-returns-value]
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/uvicorn/middleware/proxy_headers.py", line 70, in __call__
api-1       |     return await self.app(scope, receive, send)
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/applications.py", line 1054, in __call__
api-1       |     await super().__call__(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/applications.py", line 123, in __call__
api-1       |     await self.middleware_stack(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/errors.py", line 186, in __call__
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/errors.py", line 164, in __call__
api-1       |     await self.app(scope, receive, _send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/cors.py", line 85, in __call__
api-1       |     await self.app(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/exceptions.py", line 65, in __call__
api-1       |     await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 64, in wrapped_app
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
api-1       |     await app(scope, receive, sender)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 756, in __call__
api-1       |     await self.middleware_stack(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 776, in app
api-1       |     await route.handle(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 297, in handle
api-1       |     await self.app(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 77, in app
api-1       |     await wrap_app_handling_exceptions(app, request)(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 64, in wrapped_app
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
api-1       |     await app(scope, receive, sender)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 72, in app
api-1       |     response = await func(request)
api-1       |                ^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/routing.py", line 278, in app
api-1       |     raw_response = await run_endpoint_function(
api-1       |                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/routing.py", line 191, in run_endpoint_function
api-1       |     return await dependant.call(**values)
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/app/app/routers/indicators.py", line 131, in list_indicators
api-1       |     result = await db.execute(stmt)
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/ext/asyncio/session.py", line 461, in execute
api-1       |     result = await greenlet_spawn(
api-1       |              ^^^^^^^^^^^^^^^^^^^^^



nginx-1     | 172.18.0.1 - - [26/Apr/2026:02:47:19 +0000] "GET /api/v1/indicators?limit=500 HTTP/1.1" 500 21 "http://localhost/dashboard" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 201, in greenlet_spawn




nginx-1     | 172.18.0.1 - - [26/Apr/2026:02:47:19 +0000] "GET /api/v1/indicators?limit=500 HTTP/1.1" 500 21 "http://localhost/dashboard" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
api-1       |     result = context.throw(*sys.exc_info())
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/session.py", line 2351, in execute
api-1       |     return self._execute_internal(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/session.py", line 2236, in _execute_internal
api-1       |     result: Result[Any] = compile_state_cls.orm_execute_statement(
api-1       |                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/context.py", line 293, in orm_execute_statement
api-1       |     result = conn.execute(
api-1       |              ^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1418, in execute
api-1       |     return meth(
api-1       |            ^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/sql/elements.py", line 515, in _execute_on_connection
api-1       |     return connection._execute_clauseelement(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1640, in _execute_clauseelement
api-1       |     ret = self._execute_context(
api-1       |           ^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1846, in _execute_context
api-1       |     return self._exec_single_context(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1986, in _exec_single_context
api-1       |     self._handle_dbapi_exception(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 2353, in _handle_dbapi_exception
api-1       |     raise sqlalchemy_exception.with_traceback(exc_info[2]) from e
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1967, in _exec_single_context
api-1       |     self.dialect.do_execute(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/default.py", line 924, in do_execute
api-1       |     cursor.execute(statement, parameters)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 572, in execute
api-1       |     self._adapt_connection.await_(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 131, in await_only
api-1       |     return current.driver.switch(awaitable)  # type: ignore[no-any-return]
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 196, in greenlet_spawn
api-1       |     value = await result
api-1       |             ^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 550, in _prepare_and_execute
api-1       |     self._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 501, in _handle_exception
api-1       |     self._adapt_connection._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 789, in _handle_exception
api-1       |     raise translated_error from error
api-1       | sqlalchemy.exc.ProgrammingError: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError) <class 'asyncpg.exceptions.UndefinedColumnError'>: column indicators.severity does not exist
api-1       | [SQL: SELECT indicators.id, indicators.indicator_type, indicators.value, indicators.tlp, indicators.severity, indicators.confidence, indicators.country_codes, indicators.sectors, indicators.attack_categories, indicators.description, indicators.first_seen, indicators.last_seen, indicators.enrichment_data, indicators.submitted_by, indicators.stix_id, indicators.status, indicators.created_at 
api-1       | FROM indicators ORDER BY indicators.created_at DESC 
api-1       |  LIMIT $1::INTEGER OFFSET $2::INTEGER]
api-1       | [parameters: (500, 0)]
api-1       | (Background on this error at: https://sqlalche.me/e/20/f405)
api-1       | INFO:     172.18.0.8:59468 - "GET /api/v1/indicators?limit=500 HTTP/1.0" 500 Internal Server Error
api-1       | ERROR:    Exception in ASGI application
api-1       | Traceback (most recent call last):
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 514, in _prepare_and_execute
api-1       |     prepared_stmt, attributes = await adapt_connection._prepare(
api-1       |                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 765, in _prepare
api-1       |     prepared_stmt = await self._connection.prepare(
api-1       |                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 636, in prepare
api-1       |     return await self._prepare(
api-1       |            ^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 654, in _prepare
api-1       |     stmt = await self._get_statement(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 433, in _get_statement
api-1       |     statement = await self._protocol.prepare(
api-1       |                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "asyncpg/protocol/protocol.pyx", line 166, in prepare
api-1       | asyncpg.exceptions.UndefinedColumnError: column indicators.severity does not exist
api-1       | 
api-1       | The above exception was the direct cause of the following exception:
api-1       | 
api-1       | Traceback (most recent call last):
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1967, in _exec_single_context
api-1       |     self.dialect.do_execute(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/default.py", line 924, in do_execute
api-1       |     cursor.execute(statement, parameters)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 572, in execute
api-1       |     self._adapt_connection.await_(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 131, in await_only
api-1       |     return current.driver.switch(awaitable)  # type: ignore[no-any-return]
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 196, in greenlet_spawn
api-1       |     value = await result
api-1       |             ^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 550, in _prepare_and_execute
api-1       |     self._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 501, in _handle_exception
api-1       |     self._adapt_connection._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 789, in _handle_exception
api-1       |     raise translated_error from error
api-1       | sqlalchemy.dialects.postgresql.asyncpg.AsyncAdapt_asyncpg_dbapi.ProgrammingError: <class 'asyncpg.exceptions.UndefinedColumnError'>: column indicators.severity does not exist
api-1       | 
api-1       | The above exception was the direct cause of the following exception:
api-1       | 
api-1       | Traceback (most recent call last):
api-1       |   File "/usr/local/lib/python3.11/site-packages/uvicorn/protocols/http/httptools_impl.py", line 399, in run_asgi
api-1       |     result = await app(  # type: ignore[func-returns-value]
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/uvicorn/middleware/proxy_headers.py", line 70, in __call__
api-1       |     return await self.app(scope, receive, send)
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/applications.py", line 1054, in __call__
api-1       |     await super().__call__(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/applications.py", line 123, in __call__
api-1       |     await self.middleware_stack(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/errors.py", line 186, in __call__
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/errors.py", line 164, in __call__
api-1       |     await self.app(scope, receive, _send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/cors.py", line 85, in __call__
api-1       |     await self.app(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/exceptions.py", line 65, in __call__
api-1       |     await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 64, in wrapped_app
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
api-1       |     await app(scope, receive, sender)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 756, in __call__
api-1       |     await self.middleware_stack(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 776, in app
api-1       |     await route.handle(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 297, in handle
api-1       |     await self.app(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 77, in app
api-1       |     await wrap_app_handling_exceptions(app, request)(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 64, in wrapped_app
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
api-1       |     await app(scope, receive, sender)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 72, in app
api-1       |     response = await func(request)
api-1       |                ^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/routing.py", line 278, in app
api-1       |     raw_response = await run_endpoint_function(
api-1       |                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/routing.py", line 191, in run_endpoint_function
api-1       |     return await dependant.call(**values)
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/app/app/routers/indicators.py", line 131, in list_indicators
api-1       |     result = await db.execute(stmt)
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/ext/asyncio/session.py", line 461, in execute
api-1       |     result = await greenlet_spawn(
api-1       |              ^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 201, in greenlet_spawn
api-1       |     result = context.throw(*sys.exc_info())
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/session.py", line 2351, in execute
api-1       |     return self._execute_internal(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/session.py", line 2236, in _execute_internal
api-1       |     result: Result[Any] = compile_state_cls.orm_execute_statement(
api-1       |                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/context.py", line 293, in orm_execute_statement
api-1       |     result = conn.execute(
api-1       |              ^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1418, in execute
api-1       |     return meth(
api-1       |            ^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/sql/elements.py", line 515, in _execute_on_connection
api-1       |     return connection._execute_clauseelement(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1640, in _execute_clauseelement
api-1       |     ret = self._execute_context(
api-1       |           ^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1846, in _execute_context
api-1       |     return self._exec_single_context(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1986, in _exec_single_context
api-1       |     self._handle_dbapi_exception(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 2353, in _handle_dbapi_exception
api-1       |     raise sqlalchemy_exception.with_traceback(exc_info[2]) from e
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1967, in _exec_single_context
api-1       |     self.dialect.do_execute(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/default.py", line 924, in do_execute
api-1       |     cursor.execute(statement, parameters)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 572, in execute
api-1       |     self._adapt_connection.await_(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 131, in await_only
api-1       |     return current.driver.switch(awaitable)  # type: ignore[no-any-return]
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 196, in greenlet_spawn
api-1       |     value = await result
api-1       |             ^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 550, in _prepare_and_execute
api-1       |     self._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 501, in _handle_exception
api-1       |     self._adapt_connection._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 789, in _handle_exception
api-1       |     raise translated_error from error
api-1       | sqlalchemy.exc.ProgrammingError: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError) <class 'asyncpg.exceptions.UndefinedColumnError'>: column indicators.severity does not exist
api-1       | [SQL: SELECT indicators.id, indicators.indicator_type, indicators.value, indicators.tlp, indicators.severity, indicators.confidence, indicators.country_codes, indicators.sectors, indicators.attack_categories, indicators.description, indicators.first_seen, indicators.last_seen, indicators.enrichment_data, indicators.submitted_by, indicators.stix_id, indicators.status, indicators.created_at 
api-1       | FROM indicators ORDER BY indicators.created_at DESC 
api-1       |  LIMIT $1::INTEGER OFFSET $2::INTEGER]
api-1       | [parameters: (500, 0)]
api-1       | (Background on this error at: https://sqlalche.me/e/20/f405)


api-1       | INFO:     172.18.0.8:37556 - "GET /api/v1/indicators?limit=20 HTTP/1.0" 500 Internal Server Error
db-1        | 2026-04-26 02:47:42.416 UTC [61] ERROR:  column indicators.severity does not exist at character 84


nginx-1     | 172.18.0.1 - - [26/Apr/2026:02:47:42 +0000] "GET /api/v1/indicators?limit=20 HTTP/1.1" 500 21 "http://localhost/feed" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"



api-1       | ERROR:    Exception in ASGI application


db-1        | 2026-04-26 02:47:42.416 UTC [61] STATEMENT:  SELECT indicators.id, indicators.indicator_type, indicators.value, indicators.tlp, indicators.severity, indicators.confidence, indicators.country_codes, indicators.sectors, indicators.attack_categories, indicators.descriptionapi-1       | Traceback (most recent call last):ndicators.enrichment_data, indicators.submitted_by, indicators.stix_id, indicators.status, ind
icators.created_at 


db-1        |   FROM indicators ORDER BY indicators.created_at DESC 
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 514, in _prepare_and_execute
db-1        |    LIMIT $1::INTEGER OFFSET $2::INTEGER
api-1       |     prepared_stmt, attributes = await adapt_connection._prepare(


api-1       |                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 765, in _prepare
api-1       |     prepared_stmt = await self._connection.prepare(
api-1       |                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 636, in prepare
api-1       |     return await self._prepare(
api-1       |            ^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 654, in _prepare
api-1       |     stmt = await self._get_statement(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 433, in _get_statement
api-1       |     statement = await self._protocol.prepare(
api-1       |                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "asyncpg/protocol/protocol.pyx", line 166, in prepare
api-1       | asyncpg.exceptions.UndefinedColumnError: column indicators.severity does not exist
api-1       | 
api-1       | The above exception was the direct cause of the following exception:
api-1       | 
api-1       | Traceback (most recent call last):
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1967, in _exec_single_context
api-1       |     self.dialect.do_execute(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/default.py", line 924, in do_execute
api-1       |     cursor.execute(statement, parameters)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 572, in execute
api-1       |     self._adapt_connection.await_(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 131, in await_only
api-1       |     return current.driver.switch(awaitable)  # type: ignore[no-any-return]
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 196, in greenlet_spawn
api-1       |     value = await result
api-1       |             ^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 550, in _prepare_and_execute
api-1       |     self._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 501, in _handle_exception
api-1       |     self._adapt_connection._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 789, in _handle_exception
api-1       |     raise translated_error from error
api-1       | sqlalchemy.dialects.postgresql.asyncpg.AsyncAdapt_asyncpg_dbapi.ProgrammingError: <class 'asyncpg.exceptions.UndefinedColumnError'>: column indicators.severity does not exist
api-1       | 
api-1       | The above exception was the direct cause of the following exception:
api-1       | 
api-1       | Traceback (most recent call last):

nginx-1     | 172.18.0.1 - - [26/Apr/2026:02:47:42 +0000] "GET /api/v1/indicators?limit=20 HTTP/1.1" 500 21 "http://localhost/feed" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
db-1        | 2026-04-26 02:47:42.913 UTC [61] ERROR:  column indicators.severity does not exist at character 84




db-1        | 2026-04-26 02:47:42.913 UTC [61] STATEMENT:  SELECT indicators.id, indicators.indicator_type, indicators.value, indicators.tlp, indicators.severity, indicators.confidence, indicators.country_codes, indicators.sectors, indicators.attack_categories, indicators.description, indicators.first_seen, indicators.last_seen, indicators.enrichment_data, indicators.submitted_by, indicators.stix_id, indicators.status, indicators.created_at 
api-1       |   File "/usr/local/lib/python3.11/site-packages/uvicorn/protocols/http/httptools_impl.py", line 399, in run_asgi




db-1        | erFROM indicators ORDER BY indicators.created_at DESC 
api-1       |     result = await app(  # type: ignore[func-returns-value]



api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
db-1        |    LIMIT $1::INTEGER OFFSET $2::INTEGER




api-1       |   File "/usr/local/lib/python3.11/site-packages/uvicorn/middleware/proxy_headers.py", line 70, in __call__
api-1       |     return await self.app(scope, receive, send)
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/applications.py", line 1054, in __call__
api-1       |     await super().__call__(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/applications.py", line 123, in __call__
api-1       |     await self.middleware_stack(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/errors.py", line 186, in __call__
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/errors.py", line 164, in __call__
api-1       |     await self.app(scope, receive, _send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/cors.py", line 85, in __call__
api-1       |     await self.app(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/exceptions.py", line 65, in __call__
api-1       |     await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 64, in wrapped_app
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
api-1       |     await app(scope, receive, sender)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 756, in __call__
api-1       |     await self.middleware_stack(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 776, in app
api-1       |     await route.handle(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 297, in handle
api-1       |     await self.app(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 77, in app
api-1       |     await wrap_app_handling_exceptions(app, request)(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 64, in wrapped_app
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
api-1       |     await app(scope, receive, sender)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 72, in app
api-1       |     response = await func(request)
api-1       |                ^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/routing.py", line 278, in app
api-1       |     raw_response = await run_endpoint_function(
api-1       |                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/routing.py", line 191, in run_endpoint_function
api-1       |     return await dependant.call(**values)
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/app/app/routers/indicators.py", line 131, in list_indicators
api-1       |     result = await db.execute(stmt)
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/ext/asyncio/session.py", line 461, in execute
api-1       |     result = await greenlet_spawn(
api-1       |              ^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 201, in greenlet_spawn
api-1       |     result = context.throw(*sys.exc_info())
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/session.py", line 2351, in execute
api-1       |     return self._execute_internal(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/session.py", line 2236, in _execute_internal
api-1       |     result: Result[Any] = compile_state_cls.orm_execute_statement(
api-1       |                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/context.py", line 293, in orm_execute_statement
api-1       |     result = conn.execute(
api-1       |              ^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1418, in execute
api-1       |     return meth(
api-1       |            ^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/sql/elements.py", line 515, in _execute_on_connection
api-1       |     return connection._execute_clauseelement(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1640, in _execute_clauseelement
api-1       |     ret = self._execute_context(
api-1       |           ^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1846, in _execute_context
api-1       |     return self._exec_single_context(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1986, in _exec_single_context
api-1       |     self._handle_dbapi_exception(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 2353, in _handle_dbapi_exception
api-1       |     raise sqlalchemy_exception.with_traceback(exc_info[2]) from e
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1967, in _exec_single_context
api-1       |     self.dialect.do_execute(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/default.py", line 924, in do_execute
api-1       |     cursor.execute(statement, parameters)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 572, in execute
api-1       |     self._adapt_connection.await_(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 131, in await_only
api-1       |     return current.driver.switch(awaitable)  # type: ignore[no-any-return]
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 196, in greenlet_spawn
api-1       |     value = await result
api-1       |             ^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 550, in _prepare_and_execute
api-1       |     self._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 501, in _handle_exception
api-1       |     self._adapt_connection._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 789, in _handle_exception
api-1       |     raise translated_error from error
api-1       | sqlalchemy.exc.ProgrammingError: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError) <class 'asyncpg.exceptions.UndefinedColumnError'>: column indicators.severity does not exist
api-1       | [SQL: SELECT indicators.id, indicators.indicator_type, indicators.value, indicators.tlp, indicators.severity, indicators.confidence, indicators.country_codes, indicators.sectors, indicators.attack_categories, indicators.description, indicators.first_seen, indicators.last_seen, indicators.enrichment_data, indicators.submitted_by, indicators.stix_id, indicators.status, indicators.created_at 
api-1       | FROM indicators ORDER BY indicators.created_at DESC 
api-1       |  LIMIT $1::INTEGER OFFSET $2::INTEGER]
api-1       | [parameters: (20, 0)]
api-1       | (Background on this error at: https://sqlalche.me/e/20/f405)
api-1       | INFO:     ('172.18.0.8', 37568) - "WebSocket /ws/enrichment" [accepted]
api-1       | INFO:     connection open
api-1       | INFO:     172.18.0.8:37560 - "GET /api/v1/indicators?limit=20 HTTP/1.0" 500 Internal Server Error
api-1       | ERROR:    Exception in ASGI application
api-1       | Traceback (most recent call last):
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 514, in _prepare_and_execute
api-1       |     prepared_stmt, attributes = await adapt_connection._prepare(
api-1       |                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 765, in _prepare
api-1       |     prepared_stmt = await self._connection.prepare(
api-1       |                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 636, in prepare
api-1       |     return await self._prepare(
nginx-1     | 172.18.0.1 - - [26/Apr/2026:02:47:44 +0000] "GET /ws/enrichment HTTP/1.1" 101 2 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
api-1       |            ^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 654, in _prepare
api-1       |     stmt = await self._get_statement(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 433, in _get_statement
api-1       |     statement = await self._protocol.prepare(
api-1       |                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "asyncpg/protocol/protocol.pyx", line 166, in prepare
api-1       | asyncpg.exceptions.UndefinedColumnError: column indicators.severity does not exist
api-1       | 
api-1       | The above exception was the direct cause of the following exception:
api-1       | 
api-1       | Traceback (most recent call last):
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1967, in _exec_single_context
api-1       |     self.dialect.do_execute(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/default.py", line 924, in do_execute
api-1       |     cursor.execute(statement, parameters)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 572, in execute
api-1       |     self._adapt_connection.await_(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 131, in await_only
api-1       |     return current.driver.switch(awaitable)  # type: ignore[no-any-return]
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 196, in greenlet_spawn
api-1       |     value = await result
api-1       |             ^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 550, in _prepare_and_execute
api-1       |     self._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 501, in _handle_exception
api-1       |     self._adapt_connection._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 789, in _handle_exception
api-1       |     raise translated_error from error
api-1       | sqlalchemy.dialects.postgresql.asyncpg.AsyncAdapt_asyncpg_dbapi.ProgrammingError: <class 'asyncpg.exceptions.UndefinedColumnError'>: column indicators.severity does not exist
api-1       | 
api-1       | The above exception was the direct cause of the following exception:
api-1       | 
api-1       | Traceback (most recent call last):
api-1       |   File "/usr/local/lib/python3.11/site-packages/uvicorn/protocols/http/httptools_impl.py", line 399, in run_asgi
api-1       |     result = await app(  # type: ignore[func-returns-value]
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/uvicorn/middleware/proxy_headers.py", line 70, in __call__
api-1       |     return await self.app(scope, receive, send)
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/applications.py", line 1054, in __call__
api-1       |     await super().__call__(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/applications.py", line 123, in __call__
api-1       |     await self.middleware_stack(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/errors.py", line 186, in __call__
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/errors.py", line 164, in __call__
api-1       |     await self.app(scope, receive, _send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/cors.py", line 85, in __call__
api-1       |     await self.app(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/exceptions.py", line 65, in __call__
api-1       |     await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 64, in wrapped_app
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
api-1       |     await app(scope, receive, sender)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 756, in __call__
api-1       |     await self.middleware_stack(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 776, in app
api-1       |     await route.handle(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 297, in handle
api-1       |     await self.app(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 77, in app
api-1       |     await wrap_app_handling_exceptions(app, request)(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 64, in wrapped_app
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
api-1       |     await app(scope, receive, sender)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 72, in app
api-1       |     response = await func(request)
api-1       |                ^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/routing.py", line 278, in app
api-1       |     raw_response = await run_endpoint_function(
api-1       |                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/routing.py", line 191, in run_endpoint_function
api-1       |     return await dependant.call(**values)
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/app/app/routers/indicators.py", line 131, in list_indicators
api-1       |     result = await db.execute(stmt)
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/ext/asyncio/session.py", line 461, in execute
api-1       |     result = await greenlet_spawn(
api-1       |              ^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 201, in greenlet_spawn
api-1       |     result = context.throw(*sys.exc_info())
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/session.py", line 2351, in execute
api-1       |     return self._execute_internal(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/session.py", line 2236, in _execute_internal
api-1       |     result: Result[Any] = compile_state_cls.orm_execute_statement(
api-1       |                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/context.py", line 293, in orm_execute_statement
api-1       |     result = conn.execute(
api-1       |              ^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1418, in execute
api-1       |     return meth(
api-1       |            ^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/sql/elements.py", line 515, in _execute_on_connection
api-1       |     return connection._execute_clauseelement(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1640, in _execute_clauseelement
api-1       |     ret = self._execute_context(
api-1       |           ^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1846, in _execute_context
api-1       |     return self._exec_single_context(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1986, in _exec_single_context
api-1       |     self._handle_dbapi_exception(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 2353, in _handle_dbapi_exception
api-1       |     raise sqlalchemy_exception.with_traceback(exc_info[2]) from e
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1967, in _exec_single_context
api-1       |     self.dialect.do_execute(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/default.py", line 924, in do_execute
api-1       |     cursor.execute(statement, parameters)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 572, in execute
api-1       |     self._adapt_connection.await_(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 131, in await_only
api-1       |     return current.driver.switch(awaitable)  # type: ignore[no-any-return]
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 196, in greenlet_spawn
api-1       |     value = await result
api-1       |             ^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 550, in _prepare_and_execute
api-1       |     self._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 501, in _handle_exception
api-1       |     self._adapt_connection._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 789, in _handle_exception
api-1       |     raise translated_error from error
api-1       | sqlalchemy.exc.ProgrammingError: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError) <class 'asyncpg.exceptions.UndefinedColumnError'>: column indicators.severity does not exist
api-1       | [SQL: SELECT indicators.id, indicators.indicator_type, indicators.value, indicators.tlp, indicators.severity, indicators.confidence, indicators.country_codes, indicators.sectors, indicators.attack_categories, indicators.description, indicators.first_seen, indicators.last_seen, indicators.enrichment_data, indicators.submitted_by, indicators.stix_id, indicators.status, indicators.created_at 
api-1       | FROM indicators ORDER BY indicators.created_at DESC 
api-1       |  LIMIT $1::INTEGER OFFSET $2::INTEGER]
api-1       | [parameters: (20, 0)]
api-1       | (Background on this error at: https://sqlalche.me/e/20/f405)
api-1       | INFO:     connection closed
db-1        | 2026-04-26 02:47:53.325 UTC [61] ERROR:  column indicators.severity does not exist at character 84
api-1       | INFO:     172.18.0.8:54430 - "GET /api/v1/indicators?limit=20 HTTP/1.0" 500 Internal Server Error




db-1        | 2026-04-26 02:47:53.325 UTC [61] STATEMENT:  SELECT indicators.id, indicators.indicator_type, indicators.value, indicators.tlp, indicators.severity, indicators.confidence, indicators.country_codes, indicators.sectors, indicators.attack_categories, indicators.description, indicators.first_seen, indicators.last_seen, indicators.enrichment_data, indicators.submitted_by, indicators.stix_id, indicators.status, indicators.created_at 
db-1        |   FROM indicators ORDER BY indicators.created_at DESC 
db-1        |    LIMIT $1::INTEGER OFFSET $2::INTEGER


api-1       | ERROR:    Exception in ASGI application
nginx-1     | 172.18.0.1 - - [26/Apr/2026:02:47:53 +0000] "GET /api/v1/indicators?limit=20 HTTP/1.1" 500 21 "http://localhost/feed" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"



db-1        | 2026-04-26 02:47:53.469 UTC [61] ERROR:  column indicators.severity does not exist at character 84
nginx-1     | 172.18.0.1 - - [26/Apr/2026:02:47:53 +0000] "GET /api/v1/indicators?limit=20 HTTP/1.1" 500 21 "http://localhost/feed" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"


api-1       | Traceback (most recent call last):


db-1        | 2026-04-26 02:47:53.469 UTC [61] STATEMENT:  SELECT indicators.id, indicators.indicator_type, indicators.value, indicators.tlp, indicators.severity, indicators.confidence, indicators.country_codes, indicators.sectors, indicators.attack_categories, indicators.description, indicators.first_seen, indicators.last_seen, indicators.enrichment_data, indicators.submitted_by, indicators.stix_id, indicators.status, indicators.created_at 
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 514, in _prepare_and_execute




db-1        |   FROM indicators ORDER BY indicators.created_at DESC 
api-1       |     prepared_stmt, attributes = await adapt_connection._prepare(
db-1        |    LIMIT $1::INTEGER OFFSET $2::INTEGER
api-1       |                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 765, in _prepare
api-1       |     prepared_stmt = await self._connection.prepare(
api-1       |                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 636, in prepare
api-1       |     return await self._prepare(
api-1       |            ^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 654, in _prepare
api-1       |     stmt = await self._get_statement(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 433, in _get_statement
api-1       |     statement = await self._protocol.prepare(
api-1       |                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "asyncpg/protocol/protocol.pyx", line 166, in prepare
api-1       | asyncpg.exceptions.UndefinedColumnError: column indicators.severity does not exist
api-1       | 
api-1       | The above exception was the direct cause of the following exception:
api-1       | 
api-1       | Traceback (most recent call last):
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1967, in _exec_single_context
api-1       |     self.dialect.do_execute(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/default.py", line 924, in do_execute
api-1       |     cursor.execute(statement, parameters)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 572, in execute
api-1       |     self._adapt_connection.await_(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 131, in await_only
api-1       |     return current.driver.switch(awaitable)  # type: ignore[no-any-return]
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 196, in greenlet_spawn
api-1       |     value = await result
api-1       |             ^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 550, in _prepare_and_execute
api-1       |     self._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 501, in _handle_exception
api-1       |     self._adapt_connection._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 789, in _handle_exception
api-1       |     raise translated_error from error
api-1       | sqlalchemy.dialects.postgresql.asyncpg.AsyncAdapt_asyncpg_dbapi.ProgrammingError: <class 'asyncpg.exceptions.UndefinedColumnError'>: column indicators.severity does not exist
api-1       | 
api-1       | The above exception was the direct cause of the following exception:
api-1       | 
api-1       | Traceback (most recent call last):
api-1       |   File "/usr/local/lib/python3.11/site-packages/uvicorn/protocols/http/httptools_impl.py", line 399, in run_asgi
api-1       |     result = await app(  # type: ignore[func-returns-value]
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/uvicorn/middleware/proxy_headers.py", line 70, in __call__
api-1       |     return await self.app(scope, receive, send)
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/applications.py", line 1054, in __call__
api-1       |     await super().__call__(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/applications.py", line 123, in __call__
api-1       |     await self.middleware_stack(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/errors.py", line 186, in __call__
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/errors.py", line 164, in __call__
api-1       |     await self.app(scope, receive, _send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/cors.py", line 85, in __call__
api-1       |     await self.app(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/exceptions.py", line 65, in __call__
api-1       |     await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 64, in wrapped_app
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
api-1       |     await app(scope, receive, sender)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 756, in __call__
api-1       |     await self.middleware_stack(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 776, in app
api-1       |     await route.handle(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 297, in handle
api-1       |     await self.app(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 77, in app
api-1       |     await wrap_app_handling_exceptions(app, request)(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 64, in wrapped_app
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
api-1       |     await app(scope, receive, sender)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 72, in app
api-1       |     response = await func(request)
api-1       |                ^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/routing.py", line 278, in app
api-1       |     raw_response = await run_endpoint_function(
api-1       |                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/routing.py", line 191, in run_endpoint_function
api-1       |     return await dependant.call(**values)
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/app/app/routers/indicators.py", line 131, in list_indicators
api-1       |     result = await db.execute(stmt)
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/ext/asyncio/session.py", line 461, in execute
api-1       |     result = await greenlet_spawn(
api-1       |              ^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 201, in greenlet_spawn
api-1       |     result = context.throw(*sys.exc_info())
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/session.py", line 2351, in execute
api-1       |     return self._execute_internal(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/session.py", line 2236, in _execute_internal
api-1       |     result: Result[Any] = compile_state_cls.orm_execute_statement(
api-1       |                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/context.py", line 293, in orm_execute_statement
api-1       |     result = conn.execute(
api-1       |              ^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1418, in execute
api-1       |     return meth(
api-1       |            ^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/sql/elements.py", line 515, in _execute_on_connection
api-1       |     return connection._execute_clauseelement(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1640, in _execute_clauseelement
api-1       |     ret = self._execute_context(
api-1       |           ^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1846, in _execute_context
api-1       |     return self._exec_single_context(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1986, in _exec_single_context
api-1       |     self._handle_dbapi_exception(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 2353, in _handle_dbapi_exception
api-1       |     raise sqlalchemy_exception.with_traceback(exc_info[2]) from e
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1967, in _exec_single_context
api-1       |     self.dialect.do_execute(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/default.py", line 924, in do_execute
api-1       |     cursor.execute(statement, parameters)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 572, in execute
api-1       |     self._adapt_connection.await_(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 131, in await_only
api-1       |     return current.driver.switch(awaitable)  # type: ignore[no-any-return]
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 196, in greenlet_spawn
api-1       |     value = await result
api-1       |             ^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 550, in _prepare_and_execute
api-1       |     self._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 501, in _handle_exception
api-1       |     self._adapt_connection._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 789, in _handle_exception
api-1       |     raise translated_error from error
api-1       | sqlalchemy.exc.ProgrammingError: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError) <class 'asyncpg.exceptions.UndefinedColumnError'>: column indicators.severity does not exist
api-1       | [SQL: SELECT indicators.id, indicators.indicator_type, indicators.value, indicators.tlp, indicators.severity, indicators.confidence, indicators.country_codes, indicators.sectors, indicators.attack_categories, indicators.description, indicators.first_seen, indicators.last_seen, indicators.enrichment_data, indicators.submitted_by, indicators.stix_id, indicators.status, indicators.created_at 
api-1       | FROM indicators ORDER BY indicators.created_at DESC 
api-1       |  LIMIT $1::INTEGER OFFSET $2::INTEGER]
api-1       | [parameters: (20, 0)]
api-1       | (Background on this error at: https://sqlalche.me/e/20/f405)
api-1       | INFO:     172.18.0.8:54438 - "GET /api/v1/indicators?limit=20 HTTP/1.0" 500 Internal Server Error
api-1       | ERROR:    Exception in ASGI application
api-1       | Traceback (most recent call last):
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 514, in _prepare_and_execute
api-1       |     prepared_stmt, attributes = await adapt_connection._prepare(
api-1       |                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 765, in _prepare
api-1       |     prepared_stmt = await self._connection.prepare(
api-1       |                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 636, in prepare
api-1       |     return await self._prepare(
api-1       |            ^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 654, in _prepare
api-1       |     stmt = await self._get_statement(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/asyncpg/connection.py", line 433, in _get_statement
api-1       |     statement = await self._protocol.prepare(
api-1       |                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "asyncpg/protocol/protocol.pyx", line 166, in prepare
api-1       | asyncpg.exceptions.UndefinedColumnError: column indicators.severity does not exist
api-1       | 
api-1       | The above exception was the direct cause of the following exception:
api-1       | 
api-1       | Traceback (most recent call last):
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1967, in _exec_single_context
api-1       |     self.dialect.do_execute(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/default.py", line 924, in do_execute
api-1       |     cursor.execute(statement, parameters)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 572, in execute
api-1       |     self._adapt_connection.await_(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 131, in await_only
api-1       |     return current.driver.switch(awaitable)  # type: ignore[no-any-return]
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 196, in greenlet_spawn
api-1       |     value = await result
api-1       |             ^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 550, in _prepare_and_execute
api-1       |     self._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 501, in _handle_exception
api-1       |     self._adapt_connection._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 789, in _handle_exception
api-1       |     raise translated_error from error
api-1       | sqlalchemy.dialects.postgresql.asyncpg.AsyncAdapt_asyncpg_dbapi.ProgrammingError: <class 'asyncpg.exceptions.UndefinedColumnError'>: column indicators.severity does not exist
api-1       | 
api-1       | The above exception was the direct cause of the following exception:
api-1       | 
api-1       | Traceback (most recent call last):
api-1       |   File "/usr/local/lib/python3.11/site-packages/uvicorn/protocols/http/httptools_impl.py", line 399, in run_asgi
api-1       |     result = await app(  # type: ignore[func-returns-value]
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/uvicorn/middleware/proxy_headers.py", line 70, in __call__
api-1       |     return await self.app(scope, receive, send)
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/applications.py", line 1054, in __call__
api-1       |     await super().__call__(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/applications.py", line 123, in __call__
api-1       |     await self.middleware_stack(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/errors.py", line 186, in __call__
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/errors.py", line 164, in __call__
api-1       |     await self.app(scope, receive, _send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/cors.py", line 85, in __call__
api-1       |     await self.app(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/exceptions.py", line 65, in __call__
api-1       |     await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 64, in wrapped_app
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
api-1       |     await app(scope, receive, sender)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 756, in __call__
api-1       |     await self.middleware_stack(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 776, in app
api-1       |     await route.handle(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 297, in handle
api-1       |     await self.app(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 77, in app
api-1       |     await wrap_app_handling_exceptions(app, request)(scope, receive, send)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 64, in wrapped_app
api-1       |     raise exc
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
api-1       |     await app(scope, receive, sender)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/routing.py", line 72, in app
api-1       |     response = await func(request)
api-1       |                ^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/routing.py", line 278, in app
api-1       |     raw_response = await run_endpoint_function(
api-1       |                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/routing.py", line 191, in run_endpoint_function
api-1       |     return await dependant.call(**values)
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/app/app/routers/indicators.py", line 131, in list_indicators
api-1       |     result = await db.execute(stmt)
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/ext/asyncio/session.py", line 461, in execute
api-1       |     result = await greenlet_spawn(
api-1       |              ^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 201, in greenlet_spawn
api-1       |     result = context.throw(*sys.exc_info())
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/session.py", line 2351, in execute
api-1       |     return self._execute_internal(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/session.py", line 2236, in _execute_internal
api-1       |     result: Result[Any] = compile_state_cls.orm_execute_statement(
api-1       |                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/orm/context.py", line 293, in orm_execute_statement
api-1       |     result = conn.execute(
api-1       |              ^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1418, in execute
api-1       |     return meth(
api-1       |            ^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/sql/elements.py", line 515, in _execute_on_connection
api-1       |     return connection._execute_clauseelement(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1640, in _execute_clauseelement
api-1       |     ret = self._execute_context(
api-1       |           ^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1846, in _execute_context
api-1       |     return self._exec_single_context(
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1986, in _exec_single_context
api-1       |     self._handle_dbapi_exception(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 2353, in _handle_dbapi_exception
api-1       |     raise sqlalchemy_exception.with_traceback(exc_info[2]) from e
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/base.py", line 1967, in _exec_single_context
api-1       |     self.dialect.do_execute(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/engine/default.py", line 924, in do_execute
api-1       |     cursor.execute(statement, parameters)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 572, in execute
api-1       |     self._adapt_connection.await_(
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 131, in await_only
api-1       |     return current.driver.switch(awaitable)  # type: ignore[no-any-return]
api-1       |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 196, in greenlet_spawn
api-1       |     value = await result
api-1       |             ^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 550, in _prepare_and_execute
api-1       |     self._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 501, in _handle_exception
api-1       |     self._adapt_connection._handle_exception(error)
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 789, in _handle_exception
api-1       |     raise translated_error from error
api-1       | sqlalchemy.exc.ProgrammingError: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError) <class 'asyncpg.exceptions.UndefinedColumnError'>: column indicators.severity does not exist
api-1       | [SQL: SELECT indicators.id, indicators.indicator_type, indicators.value, indicators.tlp, indicators.severity, indicators.confidence, indicators.country_codes, indicators.sectors, indicators.attack_categories, indicators.description, indicators.first_seen, indicators.last_seen, indicators.enrichment_data, indicators.submitted_by, indicators.stix_id, indicators.status, indicators.created_at 
api-1       | FROM indicators ORDER BY indicators.created_at DESC 
api-1       |  LIMIT $1::INTEGER OFFSET $2::INTEGER]
api-1       | [parameters: (20, 0)]
api-1       | (Background on this error at: https://sqlalche.me/e/20/f405)
api-1       | INFO:     ('172.18.0.8', 54440) - "WebSocket /ws/enrichment" [accepted]
api-1       | INFO:     connection open