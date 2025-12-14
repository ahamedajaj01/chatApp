import React from 'react'

export default function Home() {
  return (
    <>
  {/* Hero Section with Illustration */}
      <section className="hero py-5 text-center bg-body text-body" style={{ background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' }}>
        <div className="container">
          <h1 className="display-4 fw-bold mb-3" style={{ fontSize: '3.5rem' }}>ChatApp</h1>
          <p className="lead mb-4">Communicate Seamlessly — Anytime, Anywhere</p>
          <a href="#features" className="btn btn-outline-light btn-lg px-4 py-2">Explore Features</a>
          <div className="mt-5">
            {/* Example Illustration (You can use any related image or SVG here) */}
            <img src="https://cdn.botpenguin.com/assets/website/Real_Time_Communication_e0da5ad85f.webp" alt="chat illustration" style={{ width: '500px', height: '300px' }}  className="img-fluid" />
          </div>
        </div>
      </section>

      {/* Features Section with Icons */}
      <section id="features" className="py-5 bg-body">
        <div className="container">
          <h2 className="text-center mb-4 fw-bold" style={{ fontSize: '2.5rem' }}>Why ChatApp?</h2>
          <div className="row justify-content-center text-center">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card bg-transparent border-0">
                <div className="card-body">
                  <img src="https://cdn-icons-png.flaticon.com/512/9374/9374926.png" alt="chat-icon" style={{ width: '60px', height: '60px' }} className="mb-3" />
                  <h5 className="card-title fs-4">Real-Time Messaging</h5>
                  <p className="card-text">Stay connected with instant messaging. No delays, just real-time conversations.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card bg-transparent border-0">
                <div className="card-body">
                  <img src="https://img.freepik.com/premium-vector/meeting-icon-showing-seven-people-sitting-around-circular-table-white_1077884-56368.jpg?w=360" alt="group-chat-icon" className="mb-3" style={{ width: '60px', height: '60px' }}/>
                  <h5 className="card-title fs-4">Group Chats</h5>
                  <p className="card-text">Create dynamic groups for collaboration and discussion.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card bg-transparent border-0">
                <div className="card-body">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGX8RbHOhrjw0gbO644mDVgR4gMUVi4dmb_g&s" alt="security-icon" style={{ width: '60px', height: '60px' }} className="mb-3" />
                  <h5 className="card-title fs-4">Top-Notch Security</h5>
                  <p className="card-text">End-to-end encryption ensures your conversations are always private.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section with Gradient */}
      <section className="cta text-center py-5" style={{ background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' }}>
        <div className="container">
          <h2 className="display-4 text-light mb-4">Ready to Start Chatting?</h2>
          <p className="lead text-light mb-5">Join millions of users already enjoying seamless communication.</p>
          <a href="/register" className="btn btn-light btn-lg px-5 py-3">Sign Up Now</a>
        </div>
      </section>
  
    
    </>
  )
}
