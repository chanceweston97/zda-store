export default function NewsletterForm() {
  return (
    <form>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter your email"
          className="w-full bg-gray-1 border border-gray-3 outline-hidden rounded-full placeholder:text-dark-4 py-3 px-5"
        />
        <button
          type="submit"
          className="inline-flex justify-center py-3 px-7 text-white bg-blue font-medium rounded-full ease-out duration-200 hover:bg-blue-dark"
        >
          Subscribe
        </button>
      </div>
    </form>
  );
}
