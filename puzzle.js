document.getElementById('wordForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const words = document.getElementById('words').value.split(',').map(word => word.trim().toUpperCase());
   
    const { puzzle, positions } = generateWordSearch(words);
    displayPuzzle(puzzle, false, title);
    displayPuzzle(puzzle, true, title, positions);
    document.getElementById('printButton').style.display = 'block';
  });
  
  document.getElementById('printButton').addEventListener('click', function() {
    converttoPDF("puzzleContainer", "answerKeyContainer");
    // let printable = document.getElementById("container").innerHTML;
    // let win = window.open(",");
    // win.document.write('<html>');
    // win.document.write('<body');
    // win.document.write(printable);
    // win.document.write('</body></html>');
    // // win.close();
    // win.print();
    // // window.print();
  });
  
  function generateWordSearch(words) {
    const size = 15;
    const grid = Array.from({ length: size }, () => Array(size).fill(''));
    const positions = [];
  
    function placeWord(word) {
      const directions = [
        [0, 1], [1, 0], [1, 1], [-1, 1]
      ];
      for (let attempts = 0; attempts < 100; attempts++) {
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        if (canPlaceWord(word, row, col, direction)) {
          for (let i = 0; i < word.length; i++) {
            grid[row + i * direction[0]][col + i * direction[1]] = word[i];
          }
          positions.push({ word, row, col, direction });
          return true;
        }
      }
      return false;
    }
  
    function canPlaceWord(word, row, col, direction) {
      if (row + direction[0] * word.length < 0 || row + direction[0] * word.length > size ||
          col + direction[1] * word.length < 0 || col + direction[1] * word.length > size) {
        return false;
      }
      for (let i = 0; i < word.length; i++) {
        const newRow = row + i * direction[0];
        const newCol = col + i * direction[1];
        if (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i]) {
          return false;
        }
      }
      return true;
    }
  
    words.forEach(word => {
      if (!placeWord(word)) {
        console.log(`Could not place word: ${word}`);
      }
    });
  
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (grid[i][j] === '') {
          grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
  
    return { puzzle: grid, positions };
  }
  
  function displayPuzzle(grid, isAnswerKey, title, positions = []) {
    const container = isAnswerKey ? document.getElementById('answerKeyContainer') : document.getElementById('puzzleContainer');
    container.innerHTML = `<h2>${title} ${isAnswerKey ? 'Answer Key' : 'Puzzle'}</h2>`;
    const table = document.createElement('table');
    grid.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      row.forEach((cell, colIndex) => {
        const td = document.createElement('td');
        td.textContent = cell;
        if (isAnswerKey) {
          const isWordPart = positions.some(pos => {
            const { word, row, col, direction } = pos;
            for (let i = 0; i < word.length; i++) {
              if (row + i * direction[0] === rowIndex && col + i * direction[1] === colIndex) {
                return true;
              }
            }
            return false;
          });
          if (isWordPart) {
            td.style.backgroundColor = 'yellow';
          }
        }
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    container.appendChild(table);
  }
   
  function converttoPDF(page1, page2) {
    const pdf = new jspdf.jsPDF('p', 'pt', 'a4');
  
    // Render the first page (Puzzle)
    pdf.html(document.getElementById(page1), {
      callback: function(doc) {
        // After the first page is rendered, add a new page for the second container
        doc.addPage();
        doc.setPage(2);
        doc.html(document.getElementById(page1), {
          callback: function (doc) {
            doc.save();
          }, x:10, y:10});
        // Render the second page (Answer Key) on the new page
        doc.save("puzzle.pdf");
      },
      x: 10,
      y: 10,
      autoPaging: 'text',
    });
  }