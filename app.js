    const owner = 'mnsmi';
    const repo = 'file-explorer';
    const folder = 'files';
    const tableBody = document.querySelector('#fileTable tbody');
    const searchInput = document.getElementById('search');

    const fileIcons = {
      pdf: 'picture_as_pdf',
      txt: 'description',
      doc: 'article',
      docx: 'article',
      xls: 'table_chart',
      xlsx: 'table_chart',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
      zip: 'folder_zip',
      default: 'insert_drive_file'
    };

    async function fetchFiles() {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folder}`;
      const res = await fetch(apiUrl);
      const files = await res.json();

      tableBody.innerHTML = '';

      for (const file of files) {
        if(file.type !== 'file') continue;

        const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?path=${folder}/${file.name}&per_page=1`);
        const commits = await commitsRes.json();
        const lastCommitDate = commits[0] ? new Date(commits[0].commit.committer.date).toLocaleDateString() : '-';

        const tr = document.createElement('tr');

        const ext = file.name.split('.').pop().toLowerCase();
        const iconTd = document.createElement('td');
        const iconSpan = document.createElement('span');
        iconSpan.className = 'material-icons';
        iconSpan.textContent = fileIcons[ext] || fileIcons.default;
        iconTd.appendChild(iconSpan);
        tr.appendChild(iconTd);

        const nameTd = document.createElement('td');
        nameTd.textContent = file.name;
        tr.appendChild(nameTd);

        const dateTd = document.createElement('td');
        dateTd.textContent = lastCommitDate;
        tr.appendChild(dateTd);

        const sizeTd = document.createElement('td');
        sizeTd.textContent = (file.size / 1024).toFixed(2) + ' KB';
        tr.appendChild(sizeTd);

        const downloadTd = document.createElement('td');
        const downloadIcon = document.createElement('span');
        downloadIcon.className = 'material-icons';
        downloadIcon.textContent = 'download';
        downloadIcon.onclick = () => {
          window.open(file.download_url, '_blank');
        };
        downloadTd.appendChild(downloadIcon);
        tr.appendChild(downloadTd);

        tableBody.appendChild(tr);
      }
    }

    fetchFiles();

    searchInput.addEventListener('input', () => {
      const filter = searchInput.value.toLowerCase();
      Array.from(tableBody.rows).forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        row.style.display = name.includes(filter) ? '' : 'none';
      });
    });