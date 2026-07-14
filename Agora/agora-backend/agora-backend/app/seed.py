"""
Run once after the database is up to populate starter content:

    python -m app.seed
"""
from .database import SessionLocal, Base, engine
from . import models

Base.metadata.create_all(bind=engine)
db = SessionLocal()

debate_questions = [
    ("Adaptations", "The movie adaptation can surpass the book."),
    ("Spoilers", "Spoilers ruin a story."),
    ("Character", "A great villain matters more than a great hero."),
    ("Sequels", "Sequels are rarely better than the original."),
    ("Format", 'Audiobooks count as "reading."'),
    ("Endings", "A sad ending makes a story more memorable."),
    ("Casting", "Perfect casting can save a weak script."),
]

dice_pairs = [
    ("Read the book first", "Watch the movie first"),
    ("Plot twist ending", "Slow-burn character arc"),
    ("Unreliable narrator", "Omniscient narrator"),
    ("Tragic ending", "Happy ending"),
    ("Practical effects", "CGI spectacle"),
    ("A series to binge", "A standalone story"),
    ("Antihero lead", "Reluctant hero"),
    ("Book club pick", "Movie night pick"),
]

genre_pairings = {
    "Literary Fiction": [
        ("Norwegian Wood", "Murakami on memory, loss, and youth in 1960s Tokyo.",
         "Lost in Translation", "Quiet connection between two people out of place."),
        ("The Remains of the Day", "A butler reckons with duty and a life not lived.",
         "Call Me by Your Name", "A slow, sun-drenched coming of age."),
    ],
    "Mystery & Thriller": [
        ("Gone Girl", "A marriage unravels, twist by twist.",
         "Se7en", "A grim procession toward a gut-punch ending."),
        ("The Silent Patient", "A psychotherapist obsessed with a silent patient's secret.",
         "Shutter Island", "A U.S. Marshal, an asylum, and a mind that can't be trusted."),
    ],
    "Sci-Fi & Fantasy": [
        ("House of Leaves", "A house that is bigger inside than out.",
         "Inception", "Layers of dreams within dreams."),
        ("The Name of the Wind", "A legend telling his own story.",
         "The Lord of the Rings: The Fellowship of the Ring", "A small group carries an impossible weight."),
        ("Dune", "Empire, ecology, and prophecy on a desert planet.",
         "Blade Runner 2049", "A slow-burn future built on atmosphere."),
    ],
    "Horror": [
        ("The Haunting of Hill House", "A house that keeps its own counsel.",
         "Hereditary", "Grief that curdles into something far worse."),
        ("Bird Box", "Survival when looking outside means death.",
         "A Quiet Place", "Survival when a sound means death."),
    ],
    "Romance": [
        ("Normal People", "Two people who keep finding their way back to each other.",
         "Eternal Sunshine of the Spotless Mind", "Love, memory, and the ache of losing both."),
        ("Pride and Prejudice", "Wit, pride, and a slow-earned romance.",
         "Amélie", "Whimsical Parisian warmth and quiet courage."),
    ],
    "Non-Fiction": [
        ("Sapiens", "A sweeping account of how humans came to run the world.",
         "Free Solo", "A real story told with documentary precision."),
        ("Educated", "A memoir of leaving a childhood behind to learn the world.",
         "The Social Network", "Ambition, ego, and the cost of building something big."),
    ],
}


titles = [
    ("norwegian-wood", "book", "Norwegian Wood", "Literary Fiction", "Murakami on memory, loss, and youth in 1960s Tokyo."),
    ("lost-in-translation", "film", "Lost in Translation", "Literary Fiction", "Quiet connection between two people out of place in Tokyo."),
    ("remains-of-the-day", "book", "The Remains of the Day", "Literary Fiction", "A butler reckons with duty and a life not lived."),
    ("call-me-by-your-name", "film", "Call Me by Your Name", "Literary Fiction", "A slow, sun-drenched coming of age in northern Italy."),
    ("gone-girl", "book", "Gone Girl", "Mystery & Thriller", "A marriage unravels, twist by twist."),
    ("se7en", "film", "Se7en", "Mystery & Thriller", "A grim procession toward a gut-punch ending."),
    ("silent-patient", "book", "The Silent Patient", "Mystery & Thriller", "A psychotherapist obsessed with a silent patient's secret."),
    ("shutter-island", "film", "Shutter Island", "Mystery & Thriller", "A U.S. Marshal, an asylum, and a mind that can't be trusted."),
    ("house-of-leaves", "book", "House of Leaves", "Sci-Fi & Fantasy", "A house that is bigger inside than out."),
    ("inception", "film", "Inception", "Sci-Fi & Fantasy", "Layers of dreams within dreams."),
    ("name-of-the-wind", "book", "The Name of the Wind", "Sci-Fi & Fantasy", "A legend telling his own story."),
    ("fellowship-of-the-ring", "film", "The Lord of the Rings: The Fellowship of the Ring", "Sci-Fi & Fantasy", "A small group carries an impossible weight."),
    ("dune", "book", "Dune", "Sci-Fi & Fantasy", "Empire, ecology, and prophecy on a desert planet."),
    ("blade-runner-2049", "film", "Blade Runner 2049", "Sci-Fi & Fantasy", "A slow-burn future built on atmosphere."),
    ("haunting-of-hill-house", "book", "The Haunting of Hill House", "Horror", "A house that keeps its own counsel."),
    ("hereditary", "film", "Hereditary", "Horror", "Grief that curdles into something far worse."),
    ("bird-box", "book", "Bird Box", "Horror", "Survival when looking outside means death."),
    ("a-quiet-place", "film", "A Quiet Place", "Horror", "Survival when a sound means death."),
    ("normal-people", "book", "Normal People", "Romance", "Two people who keep finding their way back to each other."),
    ("eternal-sunshine", "film", "Eternal Sunshine of the Spotless Mind", "Romance", "Love, memory, and the ache of losing both."),
    ("pride-and-prejudice", "book", "Pride and Prejudice", "Romance", "Wit, pride, and a slow-earned romance."),
    ("amelie", "film", "Amélie", "Romance", "Whimsical Parisian warmth and quiet courage."),
    ("sapiens", "book", "Sapiens", "Non-Fiction", "A sweeping account of how humans came to run the world."),
    ("free-solo", "film", "Free Solo", "Non-Fiction", "A real story told with documentary precision."),
    ("educated", "book", "Educated", "Non-Fiction", "A memoir of leaving a childhood behind to learn the world."),
    ("social-network", "film", "The Social Network", "Non-Fiction", "Ambition, ego, and the cost of building something big."),
]

starter_feedback = [
    (5, "Exactly what I needed this month — could not put it down."),
    (4, "Strong start, and the ending stuck with me for days."),
]


def run():
    if db.query(models.DebateQuestion).count() == 0:
        for tag, text in debate_questions:
            db.add(models.DebateQuestion(tag=tag, question_text=text))

    if db.query(models.DicePair).count() == 0:
        for a, b in dice_pairs:
            db.add(models.DicePair(option_a=a, option_b=b))

    if db.query(models.Genre).count() == 0:
        for genre_name, pairings in genre_pairings.items():
            genre = models.Genre(name=genre_name)
            db.add(genre)
            db.flush()  # get genre.id before inserting pairings
            for book_title, book_note, film_title, film_note in pairings:
                db.add(models.Pairing(
                    genre_id=genre.id,
                    book_title=book_title,
                    book_note=book_note,
                    film_title=film_title,
                    film_note=film_note,
                ))

    if db.query(models.Title).count() == 0:
        for slug, ttype, name, genre, blurb in titles:
            t = models.Title(id=slug, type=ttype, name=name, genre=genre, blurb=blurb)
            db.add(t)
            db.flush()
            for stars, comment in starter_feedback:
                db.add(models.Feedback(
                    title_id=slug, display_name="Agora reader",
                    stars=str(stars), comment=comment,
                ))

    db.commit()
    print("Seed complete.")


if __name__ == "__main__":
    run()
