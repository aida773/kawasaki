import fs from "node:fs";
import express from "express";
import { PrismaClient } from "@prisma/client";
import escapeHTML from "escape-html";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("static"));
const prisma = new PrismaClient();
let nitizi = 'a';
const template = fs.readFileSync("./template.html", "utf-8");
app.get("/", async (request, response) => {
  const posts = await prisma.post.findMany();
  
  const html = template.replace(
    "<!-- posts -->",
    posts.map((post) => `<li>${escapeHTML(post.message)}</li>
    <form action='/delete' method="post">
    <input type = "hidden" name="ide" value="${post.id}"/>
      <button type="submit">削除</button>
    </form>`).join(""),
  );
  response.send(html);
});

function getCurrentTime() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDate = now.getDate();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();

  return `(${currentYear}年${currentMonth}月${currentDate}日${currentHour}時${currentMinute}分${currentSecond}秒)`;
}


app.post("/send", async (request, response) => {
  nitizi = getCurrentTime(); 
  const tuika = request.body.message + nitizi;
  await prisma.Post.create({
    data: { message: tuika},
  });
  response.redirect("/");
});

app.post('/delete', async (request, response) => {
  await prisma.post.delete({
    where:{id:parseInt(request.body.ide)}
  });
  response.redirect("/");
});

app.listen(3000);
