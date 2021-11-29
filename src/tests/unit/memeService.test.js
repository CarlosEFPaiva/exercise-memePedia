import * as memeService from '../../services/memeService';

import * as memeRepository from '../../repository/memeRepository.js';
import * as userRepository from '../../repository/userRepository.js';
import badWordsFilter from 'bad-words';

jest.mock('bad-words');
describe('Unit tests for memeService.js', () => {

    describe('listMemes function', () => {
 
        it('listMemes should return "No memes today!" and an empty array if limit is <= 0', async () => {
            const result = await memeService.listMemes(0);

            expect(result.message).toEqual('No memes today!');
            expect(result.data).toEqual([]);
        })

        it('listMemes should return "No memes today!" and an empty array if no memes are returned from repository', async () => {
            jest.spyOn(memeRepository, 'listMemes').mockImplementationOnce(() => []);
            const result = await memeService.listMemes(5);

            expect(result.message).toEqual('No memes today!');
            expect(result.data).toEqual([]);
        })

        it('listMemes should return "List all memes" and an array of memes with length = 1', async () => {
            jest.spyOn(memeRepository, 'listMemes').mockImplementationOnce((limit) => {
                const numberOfMemes = (Math.floor(Math.random() * limit)) + 1;
                const mockArray = [];
                for (let i = 0; i < numberOfMemes; i++) {
                    mockArray.push('Mocked Meme');
                }
                return mockArray;
            });
            const result = await memeService.listMemes(1);

            expect(result.message).toEqual('List all memes');
            expect(result.data.length).toBeLessThanOrEqual(1);
        }),

        it('listMemes should return "List all memes" and an array of memes with length <= limit', async () => {
            jest.spyOn(memeRepository, 'listMemes').mockImplementationOnce((limit) => {
                const numberOfMemes = (Math.floor(Math.random() * limit)) + 1;
                const mockArray = [];
                for (let i = 0; i < numberOfMemes; i++) {
                    mockArray.push('Mocked Meme');
                }
                return mockArray;
            });
            const result = await memeService.listMemes(20);

            expect(result.message).toEqual('List all memes');
            expect(result.data.length).toBeLessThanOrEqual(20);
        })

    })

    describe('insertMemes function', () => {
        
        it('insertMeme should return "No user!" and an empty array if no user is found on repository', async () => {
            jest.spyOn(userRepository, 'findUserByTokenSession').mockImplementationOnce(() => []);
            const result = await memeService.insertMeme('Token', 'URL', 'text');

            expect(result.message).toEqual('No user!');
            expect(result.data).toEqual([]);
        })

        it('insertMeme should return "New meme indahouse" and the created Meme if user is found on repository and text has no badwords', async () => {
            jest.spyOn(userRepository, 'findUserByTokenSession').mockImplementationOnce(() => [{ id: 18 }]);
            jest.spyOn(memeRepository, 'insertMeme').mockImplementationOnce((url, text, id) => ({ id, text, url }));
            badWordsFilter.mockImplementationOnce(() => ({clean: ((text) => text)}));

            const result = await memeService.insertMeme('Token', 'URL', 'text');

            expect(result.message).toEqual('New meme indahouse');
            expect(result.data.id).toEqual(18);
            expect(result.data.text).toEqual('text');
            expect(result.data.url).toEqual('URL');
        })

        it('insertMeme should return "New meme indahouse" and the created Meme if user is found on repository and text has badwords to be filtered', async () => {
            jest.spyOn(userRepository, 'findUserByTokenSession').mockImplementationOnce(() => [{ id: 55 }]);
            jest.spyOn(memeRepository, 'insertMeme').mockImplementationOnce((url, text, id) => ({ id, text, url }));
            badWordsFilter.mockImplementationOnce(() => ({clean: ((text) => `Filtered - ${text}`)}));
            const result = await memeService.insertMeme('Token', 'nova URL', 'text');

            expect(result.message).toEqual('New meme indahouse');
            expect(result.data.id).toEqual(55);
            expect(result.data.text).toEqual('Filtered - text');
            expect(result.data.url).toEqual('nova URL');
        })
    })
});