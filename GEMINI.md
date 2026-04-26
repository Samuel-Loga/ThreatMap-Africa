db-1        | 2026-04-26 06:33:39.559 UTC [5563] STATEMENT:  SELECT users.id, users.email, users.username, users.hashed_password, users.role, users.organization, users.org_type, users.department, users.experience_level, users.interests, users.phone_number, users.email_notif, users.sms_notif, users.push_notif, users.update_frequency, users.full_name, users.profile_pic, users.pgp_key, users.two_factor_enabled, users.region_state, users.city, users.data_sharing_consent, users.onboarding_completed, users.trust_scor


api-1       | ERROR:    Exception in ASGI application
nginx-1     | 172.18.0.1 - - [26/Apr/2026:06:33:39 +0000] "PATCH /api/v1/auth/me HTTP/1.1" 500 21 "http://localhost/onboarding" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
db-1        |   FROM users 
db-1        | TrWHERE users.id = $1::UUID last):
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
api-1       | asyncpg.exceptions.UndefinedColumnError: column users.org_type does not exist
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
api-1       | sqlalchemy.dialects.postgresql.asyncpg.AsyncAdapt_asyncpg_dbapi.ProgrammingError: <class 'asyncpg.exceptions.UndefinedColumnError'>: column users.org_type does not exist
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
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/cors.py", line 93, in __call__
api-1       |     await self.simple_response(scope, receive, send, request_headers=headers)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/cors.py", line 148, in simple_response
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
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/routing.py", line 269, in app
api-1       |     solved_result = await solve_dependencies(
api-1       |                     ^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/dependencies/utils.py", line 600, in solve_dependencies
api-1       |     solved = await call(**sub_values)
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/app/app/dependencies.py", line 33, in get_current_user
api-1       |     result = await db.execute(select(User).where(User.id == user_uuid))
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
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
api-1       | sqlalchemy.exc.ProgrammingError: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError) <class 'asyncpg.exceptions.UndefinedColumnError'>: column users.org_type does not exist
api-1       | [SQL: SELECT users.id, users.email, users.username, users.hashed_password, users.role, users.organization, users.org_type, users.department, users.experience_level, users.interests, users.phone_number, users.email_notif, users.sms_notif, users.push_notif, users.update_frequency, users.full_name, users.profile_pic, users.pgp_key, users.two_factor_enabled, users.region_state, users.city, users.data_sharing_consent, users.onboarding_completed, users.trust_score, users.reputation_points, users.verification_level, users.is_active, users.created_at 
api-1       | FROM users 
api-1       | WHERE users.id = $1::UUID]
api-1       | [parameters: (UUID('af4ab339-5ffd-409f-9dc8-64654270e3f2'),)]
api-1       | (Background on this error at: https://sqlalche.me/e/20/f405)


db-1        | 2026-04-26 06:33:44.609 UTC [5563] ERROR:  column users.org_type does not exist at character 102
api-1       | INFO:     172.18.0.8:36866 - "PATCH /api/v1/auth/me HTTP/1.0" 500 Internal Server Error
nginx-1     | 172.18.0.1 - - [26/Apr/2026:06:33:44 +0000] "PATCH /api/v1/auth/me HTTP/1.1" 500 21 "http://localhost/onboarding" "

api-1       | ERROR:    Exception in ASGI application
db-1        | 2026-04-26 06:33:44.609 UTC [5563] STATEMENT:  SELECT users.id, users.email, users.username, users.hashed_password, users.role, users.organization, users.org_type, users.department, users.experience_level, users.interests, users.phone_number, users.email_notif, users.sms_notif, users.push_notif, users.update_frequency, users.full_name, users.profile_pic, users.pgp_key, users.two_factor_enabled, users.region_state, users.city, users.data_sharing_consent, users.onboarding_completed, users.trust_score, users.reputation_points, users.verification_level, users.is_active, users.created_at 
nginx-1     | 172.18.0.1 - - [26/Apr/2026:06:33:44 +0000] "PATCH /api/v1/auth/me HTTP/1.1" 500 21 "http://localhost/onboarding" "

db-1        |   FROM users 
api-1       | Traceback (most recent call last):


db-1        |   WHERE users.id = $1::UUID


api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 514, in _prepare_and_execute

db-1        | 2026-04-26 06:33:44.636 UTC [5563] STATEMENT:  SELECT users.id, users.email, users.username, users.hashed_password, users.role, users.organization, users.org_type, users.department, users.experience_level, users.interests, users.phone_number, users.email_notif, users.sms_notif, users.push_notif, users.update_frequency, users.full_name, users.profile_pic, users.pgp_key, users.two_factor_enabled, users.region_state, users.city, users.data_sharing_consent, users.onboarding_completed, users.trust_scor

api-1       |                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 765, in _prepare
db-1        |   FROM users 
api-1       |     prepared_stmt = await self._connection.prepare(

db-1        |   WHERE users.id = $1::UUID

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
api-1       | asyncpg.exceptions.UndefinedColumnError: column users.org_type does not exist
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
api-1       | sqlalchemy.dialects.postgresql.asyncpg.AsyncAdapt_asyncpg_dbapi.ProgrammingError: <class 'asyncpg.exceptions.UndefinedColumnError'>: column users.org_type does not exist
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
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/cors.py", line 93, in __call__
api-1       |     await self.simple_response(scope, receive, send, request_headers=headers)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/cors.py", line 148, in simple_response
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
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/routing.py", line 269, in app
api-1       |     solved_result = await solve_dependencies(
api-1       |                     ^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/dependencies/utils.py", line 600, in solve_dependencies
api-1       |     solved = await call(**sub_values)
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/app/app/dependencies.py", line 33, in get_current_user
api-1       |     result = await db.execute(select(User).where(User.id == user_uuid))
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
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
api-1       | sqlalchemy.exc.ProgrammingError: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError) <class 'asyncpg.exceptions.UndefinedColumnError'>: column users.org_type does not exist
api-1       | [SQL: SELECT users.id, users.email, users.username, users.hashed_password, users.role, users.organization, users.org_type, users.department, users.experience_level, users.interests, users.phone_number, users.email_notif, users.sms_notif, users.push_notif, users.update_frequency, users.full_name, users.profile_pic, users.pgp_key, users.two_factor_enabled, users.region_state, users.city, users.data_sharing_consent, users.onboarding_completed, users.trust_score, users.reputation_points, users.verification_level, users.is_active, users.created_at 
api-1       | FROM users 
api-1       | WHERE users.id = $1::UUID]
api-1       | [parameters: (UUID('af4ab339-5ffd-409f-9dc8-64654270e3f2'),)]
api-1       | (Background on this error at: https://sqlalche.me/e/20/f405)
api-1       | INFO:     172.18.0.8:36868 - "PATCH /api/v1/auth/me HTTP/1.0" 500 Internal Server Error
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
api-1       | asyncpg.exceptions.UndefinedColumnError: column users.org_type does not exist
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
api-1       | sqlalchemy.dialects.postgresql.asyncpg.AsyncAdapt_asyncpg_dbapi.ProgrammingError: <class 'asyncpg.exceptions.UndefinedColumnError'>: column users.org_type does not exist
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
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/cors.py", line 93, in __call__
api-1       |     await self.simple_response(scope, receive, send, request_headers=headers)
api-1       |   File "/usr/local/lib/python3.11/site-packages/starlette/middleware/cors.py", line 148, in simple_response
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
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/routing.py", line 269, in app
api-1       |     solved_result = await solve_dependencies(
api-1       |                     ^^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/usr/local/lib/python3.11/site-packages/fastapi/dependencies/utils.py", line 600, in solve_dependencies
api-1       |     solved = await call(**sub_values)
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^
api-1       |   File "/app/app/dependencies.py", line 33, in get_current_user
api-1       |     result = await db.execute(select(User).where(User.id == user_uuid))
api-1       |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
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
api-1       | sqlalchemy.exc.ProgrammingError: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError) <class 'asyncpg.exceptions.UndefinedColumnError'>: column users.org_type does not exist
api-1       | [SQL: SELECT users.id, users.email, users.username, users.hashed_password, users.role, users.organization, users.org_type, users.department, users.experience_level, users.interests, users.phone_number, users.email_notif, users.sms_notif, users.push_notif, users.update_frequency, users.full_name, users.profile_pic, users.pgp_key, users.two_factor_enabled, users.region_state, users.city, users.data_sharing_consent, users.onboarding_completed, users.trust_score, users.reputation_points, users.verification_level, users.is_active, users.created_at 
api-1       | FROM users 
api-1       | WHERE users.id = $1::UUID]
api-1       | [parameters: (UUID('af4ab339-5ffd-409f-9dc8-64654270e3f2'),)]
api-1       | (Background on this error at: https://sqlalche.me/e/20/f405)
