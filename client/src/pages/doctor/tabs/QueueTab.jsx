git checkout main
git pull origin main
git checkout -b feat/member-7-admin-dashboard
git config user.name "Member 7 Full Name"
git config user.email "member7@example.com"
git add client/src/pages/admin/
git commit -m "feat(admin-ui): create hospital admin dashboard layout, operational overview, and appointments tab"
git push -u origin feat/member-7-admin-dashboard