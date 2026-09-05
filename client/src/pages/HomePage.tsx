import CreateRoomForm from "../components/home/CreateRoomForm";
import JoinRoomForm from "../components/home/JoinRoomForm";

const HomePage = () => {
  return (
    <main className="home-page">
      <div className="home-container">
        <section className="home-hero">
          <p className="home-eyebrow">
            WATCH TOGETHER
          </p>

          <h1 className="home-title">
            YouTube Watch Party
          </h1>

          <p className="home-description">
            Create a room, invite your friends, and
            watch YouTube videos together in real
            time.
          </p>
        </section>

        <section className="home-forms">
          <CreateRoomForm />
          <JoinRoomForm />
        </section>
      </div>
    </main>
  );
};

export default HomePage;