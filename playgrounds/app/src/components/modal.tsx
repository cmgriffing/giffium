import { AiFillCloseCircle, AiOutlineMinus } from 'solid-icons/ai'
import { Dialog } from '@kobalte/core/dialog'

export default function ModalComponent1(props: {
  isOpen: boolean
  onClose: () => void
  modalType: string
  openQuestions: number[]
  toggleQuestion: (index: number) => void
}) {
  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <Dialog.Overlay class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Dialog.Content class="relative bg-white dark:bg-neutral-800 p-6 rounded-lg w-96 shadow-lg">
          <Dialog.Trigger
            class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
            onClick={props.onClose}
            aria-label="Close modal"
          >
            <AiFillCloseCircle />
          </Dialog.Trigger>{' '}
          <Dialog.Description class="mb-4">
            {props.modalType === 'how-work' && (
              <>
                <Dialog.Title class="text-xl font-semibold mb-4 dialog__title">
                  About Giffium
                </Dialog.Title>
                <Dialog.Description>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. A quidem repudiandae
                  praesentium reiciendis tempora mollitia dolorum incidunt quibusdam earum veritatis
                  aliquam aperiam debitis cumque, neque iure nihil facere, laudantium obcaecati
                  quod? Consectetur, soluta fugit expedita tenetur ratione assumenda impedit
                  doloribus alias beatae voluptatibus accusantium repellendus eos mollitia
                  laudantium consequatur voluptatum.
                </Dialog.Description>
              </>
            )}
            {props.modalType === 'faqs' && (
              <>
                <Dialog.Title class="text-xl font-semibold mb-4">FAQs</Dialog.Title>
                <Dialog.Description as="ul" class="space-y-4">
                  <Dialog.Description
                    as="li"
                    class="flex items-start cursor-pointer"
                    onClick={() => props.toggleQuestion(1)}
                  >
                    <AiOutlineMinus class="text-gray-500 mr-2" />
                    <Dialog.Description>
                      <Dialog.Description as="span">How do I create a new gif?</Dialog.Description>
                      {props.openQuestions.includes(1) && (
                        <Dialog.Description as="p" class="mt-2 text-gray-500 dark:text-gray-300">
                          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi atque, a
                          quos fugiat incidunt vero, dicta voluptatem accusamus dolorem laboriosam,
                          beatae commodi possimus sunt ullam eius qui! Rerum ab totam provident est
                          cumque, molestias sit.
                        </Dialog.Description>
                      )}
                    </Dialog.Description>
                  </Dialog.Description>
                  <Dialog.Description
                    as="li"
                    class="flex items-start cursor-pointer"
                    onClick={() => props.toggleQuestion(2)}
                  >
                    <AiOutlineMinus class="text-gray-500 mr-2" />
                    <Dialog.Description>
                      <Dialog.Description as="span">How do I change the theme?</Dialog.Description>
                      {props.openQuestions.includes(2) && (
                        <Dialog.Description as="p" class="mt-2 text-gray-500 dark:text-gray-300">
                          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Magni nobis
                          consequuntur numquam quasi ad mollitia accusamus, dolorum, soluta aliquam
                          ea blanditiis minima id, dignissimos voluptas? Commodi, unde amet.
                          Repellat incidunt nisi vitae hic asperiores sapiente!
                        </Dialog.Description>
                      )}
                    </Dialog.Description>
                  </Dialog.Description>
                  <Dialog.Description
                    as="li"
                    class="flex items-start cursor-pointer"
                    onClick={() => props.toggleQuestion(3)}
                  >
                    <AiOutlineMinus class="text-gray-500 mr-2" />
                    <Dialog.Description>
                      <Dialog.Description as="span">How do I manage my drafts?</Dialog.Description>
                      {props.openQuestions.includes(3) && (
                        <Dialog.Description as="p" class="mt-2 text-gray-500 dark:text-gray-300">
                          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Architecto
                          dolorem totam mollitia quisquam laboriosam, sint beatae minus vitae est,
                          perspiciatis non suscipit. Voluptates facilis facere sequi voluptatum
                          laudantium hic saepe tempore, consectetur quibusdam ipsam earum.
                        </Dialog.Description>
                      )}
                    </Dialog.Description>
                  </Dialog.Description>
                </Dialog.Description>
              </>
            )}
          </Dialog.Description>
          <Dialog.Trigger
            class="mt-4 w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition dark:bg-white dark: dark:text-black"
            onClick={props.onClose}
          >
            Close
          </Dialog.Trigger>
        </Dialog.Content>
      </Dialog.Overlay>
    </Dialog>
  )
}
