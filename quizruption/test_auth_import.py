from app.routes import auth
print(f"Auth router: {auth.router}")
print(f"Routes: {auth.router.routes}")
for route in auth.router.routes:
    print(f"  - {route.path} ({route.methods})")
