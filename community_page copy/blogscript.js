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
    
    this.initializeChat();
  },
  methods: {
    
    initializeChat() {
      this.socket = io('https://community-server-mbch.onrender.com');


      this.socket.on('chat message', (msg) => {
        this.appendChatMessage(msg);
      });

      const chatBtn = document.getElementById('chat-btn');
      const chatModal = document.getElementById('chat-modal');
      const chatInput = document.getElementById('chat-input');
      const chatSend = document.getElementById('chat-send');
      const chatClose = document.getElementById('chat-close');

      
     

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


const accessKey = '75a07da6702dd911b3d0c6a7dfbe2795';

// State to track likes by the user
const userLikes = {};

async function fetchBlogs() {
    try {
        const response = await fetch(`https://api.mediastack.com/v1/news?access_key=${accessKey}&categories=health&limit=9&timestamp=${new Date().getTime()}`);
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
                <button onclick="toggleLike(${index})" id="like-btn-${index}" class="text-gray-500 flex items-center space-x-1">
                    <span id="like-icon-${index}">👍</span><span id="like-count-${index}">0</span>
                </button>
                <button onclick="toggleComment(${index})" class="text-gray-500 flex items-center space-x-1">
                    <span>💬</span><span>Comment</span>
                </button>
            </div>
            <div id="comment-section-${index}" class="mt-4 hidden bg-blue-500 p-4 rounded-lg">
                <textarea id="comment-input-${index}" class="w-full p-3 mt-2 bg-gray-700 text-white rounded-md focus:outline-none" placeholder="Write your comment..."></textarea>
                <button onclick="addComment(${index})" class="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md">Submit</button>
                <div id="comments-container-${index}" class="mt-4 space-y-2 text-sm text-gray-100"></div>
            </div>
        `;

        blogContainer.appendChild(blogCard);
        userLikes[index] = false; // Initialize like state
    });
}

function truncateContent(content) {
    return content && content.length > 100 ? content.slice(0, 100) + "..." : content;
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

function toggleLike(index) {
    const likeCountElement = document.getElementById(`like-count-${index}`);
    const likeIconElement = document.getElementById(`like-icon-${index}`);

    if (userLikes[index]) {
        // If already liked, remove the like
        likeCountElement.innerText = parseInt(likeCountElement.innerText) - 1;
        userLikes[index] = false;
        likeIconElement.textContent = "👍"; // Reset icon
    } else {
        // If not liked, add the like
        likeCountElement.innerText = parseInt(likeCountElement.innerText) + 1;
        userLikes[index] = true;
        likeIconElement.textContent = "❤️"; // Change icon to indicate liked
    }
}

function addComment(index) {
    const commentInput = document.getElementById(`comment-input-${index}`);
    const commentText = commentInput.value.trim();

    if (commentText) {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const username = userData ? `${userData.firstName} ${userData.lastName}` : "Anonymous";

        const commentsContainer = document.getElementById(`comments-container-${index}`);
        const commentDiv = document.createElement("div");
        commentDiv.className = "bg-gray-700 p-3 rounded-md";
        commentDiv.innerHTML = `<strong>${username}:</strong> ${commentText}`;
        commentsContainer.appendChild(commentDiv);

        commentInput.value = "";
    }
}

fetchBlogs();


