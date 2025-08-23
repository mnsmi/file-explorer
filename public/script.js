async function login() {
  const res = await fetch("/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      username: document.getElementById("username").value,
      password: document.getElementById("password").value
    })
  });
  if(!res.ok){ document.getElementById("loginMsg").innerText="Fout!"; return; }
  const data = await res.json();
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("fileBox").classList.remove("hidden");
  if(data.role==="admin") document.getElementById("adminTools").classList.remove("hidden");
  loadFiles();
}

async function logout(){ await fetch("/logout",{method:"POST"}); location.reload(); }

async function loadFiles(){
  const res = await fetch("/files");
  const data = await res.json();
  const list = document.getElementById("fileList"); list.innerHTML="";
  data.files.forEach(file=>{
    const li=document.createElement("li");
    li.innerHTML=`<a href="/download/${file}">${file}</a>`;
    if(data.role==="admin"){
      const delBtn=document.createElement("button");
      delBtn.innerText="Verwijder";
      delBtn.onclick=async()=>{await fetch("/delete/"+file,{method:"DELETE"}); loadFiles();}
      li.appendChild(delBtn);
    }
    list.appendChild(li);
  });
}

document.getElementById("loginBtn").onclick=login;
document.getElementById("logout").onclick=logout;
document.getElementById("uploadBtn").onclick=async()=>{
  const file=document.getElementById("uploadFile").files[0];
  const formData=new FormData(); formData.append("file",file);
  await fetch("/upload",{method:"POST",body:formData});
  loadFiles();
};
