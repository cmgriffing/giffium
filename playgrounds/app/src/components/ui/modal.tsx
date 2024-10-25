import { Show } from 'solid-js'
import { AiFillCloseCircle, AiFillMinusCircle, AiOutlineMinus } from 'solid-icons/ai'

export default function ModalComponent(props: {
  isOpen: boolean
  onClose: () => void
  modalType: string
  openQuestions: number[]
  toggleQuestion: (index: number) => void
}) {
  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="relative bg-white dark:bg-neutral-800 p-6 rounded-lg w-96 shadow-lg">
          <button
            class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
            onClick={props.onClose}
            aria-label="Close modal"
          >
            <AiFillCloseCircle />
          </button>
          <Show when={props.modalType === 'how-work'}>
            <h2 class="text-xl font-semibold mb-4">How the App Works</h2>
            <p class="mb-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. A quidem repudiandae
              praesentium reiciendis tempora mollitia dolorum incidunt quibusdam earum veritatis
              aliquam aperiam debitis cumque, neque iure nihil facere, laudantium obcaecati quod?
              Consectetur, soluta fugit expedita tenetur ratione assumenda impedit doloribus alias
              beatae voluptatibus accusantium repellendus eos mollitia laudantium consequatur
              voluptatum.
            </p>
          </Show>
          <Show when={props.modalType === 'faqs'}>
            <h2 class="text-xl font-semibold mb-4">FAQs</h2>
            <ul class="space-y-4">
              <li class="flex items-start cursor-pointer" onClick={() => props.toggleQuestion(1)}>
                <AiOutlineMinus class="text-gray-500 mr-2" />
                <div>
                  <span>How do I create a new blog post?</span>
                  <Show when={props.openQuestions.includes(1)}>
                    <p class="mt-2 text-gray-500 dark:text-gray-300">
                      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi atque, a quos
                      fugiat incidunt vero, dicta voluptatem accusamus dolorem laboriosam, beatae
                      commodi possimus sunt ullam eius qui! Rerum ab totam provident est cumque,
                      molestias sit.
                    </p>
                  </Show>
                </div>
              </li>
              <li class="flex items-start cursor-pointer" onClick={() => props.toggleQuestion(2)}>
                <AiOutlineMinus class="text-gray-500 mr-2" />
                <div>
                  <span>How do I change the theme?</span>
                  <Show when={props.openQuestions.includes(2)}>
                    <p class="mt-2 text-gray-500 dark:text-gray-300">
                      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Magni nobis
                      consequuntur numquam quasi ad mollitia accusamus, dolorum, soluta aliquam ea
                      blanditiis minima id, dignissimos voluptas? Commodi, unde amet. Repellat
                      incidunt nisi vitae hic asperiores sapiente!
                    </p>
                  </Show>
                </div>
              </li>
              <li class="flex items-start cursor-pointer" onClick={() => props.toggleQuestion(3)}>
                <AiOutlineMinus class="text-gray-500 mr-2" />
                <div>
                  <span>How do I manage my drafts?</span>
                  <Show when={props.openQuestions.includes(3)}>
                    <p class="mt-2 text-gray-500 dark:text-gray-300">
                      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Architecto dolorem
                      totam mollitia quisquam laboriosam, sint beatae minus vitae est, perspiciatis
                      non suscipit. Voluptates facilis facere sequi voluptatum laudantium hic saepe
                      tempore, consectetur quibusdam ipsam earum.
                    </p>
                  </Show>
                </div>
              </li>
            </ul>
          </Show>
          <button
            class="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            onClick={props.onClose}
          >
            Close
          </button>
        </div>
      </div>
    </Show>
  )
}
