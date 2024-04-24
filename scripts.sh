# 1. Init prisma
npx prisma init --datasource-provider mysql

#2 . Generate Schema 
npx prisma generate

#3. Sync DB with prisma schema
npx prisma db push

#4.To Open up prisma studion
npx prisma studio