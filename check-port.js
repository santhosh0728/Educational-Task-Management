const net = require("net")

// Function to check if a port is in use
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer()

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`❌ Port ${port} is already in use!`)
        resolve(false)
      } else {
        console.log(`❌ Error checking port ${port}:`, err.message)
        resolve(false)
      }
    })

    server.once("listening", () => {
      server.close()
      console.log(`✅ Port ${port} is available`)
      resolve(true)
    })

    server.listen(port)
  })
}

// Check port 5001
async function main() {
  console.log("🔍 Checking if port 5001 is available...")
  const isAvailable = await checkPort(5001)

  if (!isAvailable) {
    console.log(`
    ⚠️ Port 5001 is already in use!
    
    This means another process is already using this port.
    It could be:
    1. Another instance of your server
    2. A different application
    
    Try these solutions:
    1. Stop any other servers running on port 5001
    2. Change your server port in .env to a different number (e.g., PORT=5002)
    3. Restart your computer to clear any stuck processes
    
    To find and kill the process using port 5001:
    - On Windows: Run 'netstat -ano | findstr :5001' then 'taskkill /PID [PID] /F'
    - On Mac/Linux: Run 'lsof -i :5001' then 'kill -9 [PID]'
    `)
  } else {
    console.log(`
    ✅ Port 5001 is available and ready to use!
    
    You can start your server on this port.
    `)
  }
}

main()
