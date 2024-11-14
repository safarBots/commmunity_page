new Vue({
    el: '#app',
    data: {
      blogPosts: [],
      socket: null,
      loading: false,
      error: false,
      username: '', // Add username field
      messages: [] // Store chat messages
    },
    mounted() {
      this.fetchBlogPosts();
      this.initializeChat();
    },
    methods: {
      async fetchBlogPosts() {
        // Fetching posts logic
      },
      initializeChat() {
        this.socket = io('http://localhost:3000');


        this.socket.on('chat message', (msg) => {
          this.appendChatMessage(msg);
        });

        const chatBtn = document.getElementById('chat-btn');
        const chatModal = document.getElementById('chat-modal');
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        const chatClose = document.getElementById('chat-close');

        const profileBtn = document.getElementById('profile-btn');
        const profileModal = document.getElementById('profile-modal');
        const profileClose = document.getElementById('profile-close');
        const saveProfile = document.getElementById('save-profile');

        chatBtn.addEventListener('click', () => {
          chatModal.classList.remove('hidden');
        });

        chatClose.addEventListener('click', () => {
          chatModal.classList.add('hidden');
        });

        chatModal.addEventListener('click', (e) => {
          if (e.target === chatModal) {
            chatModal.classList.add('hidden');
          }
        });

        profileBtn.addEventListener('click', () => {
          profileModal.classList.remove('hidden');
        });

        profileClose.addEventListener('click', () => {
          profileModal.classList.add('hidden');
        });

        saveProfile.addEventListener('click', () => {
          const name = document.getElementById('user-name').value.trim() || "Anonymous";
          if (name) this.userName = name;
          profileModal.classList.add('hidden');
        });

        chatInput.addEventListener('keyup', () => {
            const msg = chatInput.value.trim();
            if (event.key === 'Enter') {
              const msgOb = { username: this.userName ||"Anonymous", text: message };
              this.socket.emit('chat message', msgOb);
              chatInput.value = '';
            }
        });

        chatSend.addEventListener('click', () => {
          const message = chatInput.value.trim();
          if (message) {
            const msgObj = { username: this.userName ||"Anonymous", text: message };
            this.socket.emit('chat message', msgObj);
            chatInput.value = '';
          }
        });
      },
      appendChatMessage(msg) {
        const chatMessages = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.textContent = `${msg.username}: ${msg.text}`;
        messageElement.classList.add('bg-gray-700', 'p-2', 'rounded', 'mb-2');
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }
  });


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const accessKey = '77c34689604bb18292cd6cb624e447b6'; 

async function fetchBlogs() {
    try {
        // Added a cache-busting query parameter to ensure fresh data on each refresh
        const response = await fetch(`http://api.mediastack.com/v1/news?access_key=${accessKey}&categories=health&limit=9&timestamp=${new Date().getTime()}`);
        const data = await response.json();

        if (data.data) {
            renderBlogs(data.data);
        } else {
            console.error("No data available.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function renderBlogs(blogs) {
    const blogContainer = document.getElementById("blog-container");
    blogContainer.innerHTML = "";

    blogs.forEach((blog, index) => {
        const blogCard = document.createElement("div");
        blogCard.className = "bg-gray-800 shadow-xl rounded-lg overflow-hidden p-6 transition-transform transform hover:scale-105";

        blogCard.innerHTML = `
      <h2 class="text-2xl font-semibold text-blue-500 mb-4"><a href="${blog.url}" target="_blank" class="text-blue-500 hover:underline">${blog.title}</a></h2>
      <p class="text-gray-300 text-sm mb-4" id="content-${index}">${truncateContent(blog.description)}</p>
      <button onclick="toggleContent(${index})" class="text-blue-400 hover:underline mb-2"><a href="${blog.url}" target="_blank">Read More</a></button>
      
      <div class="flex items-center justify-between mt-4">
        <button onclick="likeBlog(${index})" class="text-gray-500 flex items-center space-x-1">
          <span>👍</span><span id="like-count-${index}">0</span>
        </button>
        <button onclick="toggleComment(${index})" class="text-gray-500 flex items-center space-x-1">
          <span>💬</span><span>Comment</span>
        </button>
      </div>

      <div id="comment-section-${index}" class="mt-4 hidden bg-blue-500 p-4 rounded-lg">
        <textarea id="comment-input-${index}" @keyup.enter="addComment(${index})" class="w-full p-3 mt-2 bg-gray-700 text-white rounded-md focus:outline-none" placeholder="Write your comment..."></textarea>
        <button onclick="addComment(${index})" class="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md">Submit</button>
        <div id="comments-container-${index}" class="mt-4 space-y-2 text-sm text-gray-100"></div>
      </div>
    `;

        blogContainer.appendChild(blogCard);
    });
}

function truncateContent(content) {
    return content.length > 100 ? content.slice(0, 100) + "..." : content;
}

function toggleContent(index) {
    const contentElement = document.getElementById(`content-${index}`);
    const isTruncated = contentElement.innerText.endsWith("...");

    contentElement.innerText = isTruncated ? contentElement.innerText.replace("...", "") : contentElement.innerText.slice(0, 100) + "...";
}

function toggleComment(index) {
    const commentSection = document.getElementById(`comment-section-${index}`);
    commentSection.classList.toggle("hidden");
}

function likeBlog(index) {
    const likeCount = document.getElementById(`like-count-${index}`);
    likeCount.innerText = parseInt(likeCount.innerText) + 1;
}

function addComment(index) {
    const commentInput = document.getElementById(`comment-input-${index}`);
    const commentText = commentInput.value.trim();

    if (commentText) {
        const username = document.getElementById('user-name').value.trim() || "Anonymous";
        if (username) {
            const commentsContainer = document.getElementById(`comments-container-${index}`);
            const commentDiv = document.createElement("div");
            commentDiv.className = "bg-gray-700 p-3 rounded-md";
            commentDiv.innerHTML = `<strong>${username}:</strong> ${commentText}`;
            commentsContainer.appendChild(commentDiv);
            commentInput.value = ""; 
        }
    }
}

fetchBlogs(); 

